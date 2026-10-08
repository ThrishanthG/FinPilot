import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AssessmentDto } from './dto/assessment.dto';
import { ConfigService } from '@nestjs/config';
import { RiskLevel } from '../common/prisma-enums';
import http from 'http';

@Injectable()
export class AssessmentsService {
  private mlServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @InjectQueue('assessment-queue') private assessmentQueue: Queue
  ) {
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
  }

  async submitAssessment(userId: string, dto: AssessmentDto) {
    // Save monthly/annual incomes to the User profile table immediately (validated)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        age: dto.age,
        occupation: dto.personalInfo.occupation,
        monthlyIncome: dto.personalInfo.monthlyIncome,
        annualIncome: dto.personalInfo.annualIncome,
      },
    });

    // Queue the heavy classification computation
    const job = await this.assessmentQueue.add('calculate-risk', {
      userId,
      assessmentData: dto,
    });

    return {
      message: 'Assessment submitted. Risk profiling job queued.',
      jobId: job.id,
    };
  }

  async getLatestAssessment(userId: string) {
    const assessment = await this.prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (assessment && typeof assessment.answers === 'string') {
      try {
        (assessment as any).answers = JSON.parse(assessment.answers);
      } catch {}
    }
    return assessment;
  }

  async getSuggestedModelAllocation(riskLevel: RiskLevel, age: number, horizonYears: number, goal: string) {
    // Query local model recommendation rules or FastAPI ML endpoint
    try {
      const response = await fetch(`${this.mlServiceUrl}/api/v1/ml/suggest-allocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_level: riskLevel,
          age,
          horizon_years: horizonYears,
          investment_goal: goal
        })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      // Fallback local engine if FastAPI service is unreachable
      console.warn('ML Service unreachable. Using fallback engine for suggest-allocation.');
    }

    // Heuristic Fallback
    let allocation = {};
    let explanation = '';
    if (riskLevel === 'CONSERVATIVE') {
      allocation = { MUTUAL_FUNDS: 50.0, BONDS: 30.0, FIXED_DEPOSIT: 20.0 };
      explanation = 'Preserving capital with high fixed-income and debt allocations (Fallback suggestion).';
    } else if (riskLevel === 'AGGRESSIVE') {
      allocation = { STOCKS: 60.0, ETF: 20.0, MUTUAL_FUNDS: 10.0, CRYPTO: 10.0 };
      explanation = 'High-growth strategy utilizing index ETFs, direct stocks, and crypto (Fallback suggestion).';
    } else {
      allocation = { STOCKS: 40.0, MUTUAL_FUNDS: 35.0, BONDS: 20.0, ETF: 5.0 };
      explanation = 'Balanced moderate layout mixing equity and bond buffers (Fallback suggestion).';
    }

    return { allocation, explanation, risk_level: riskLevel };
  }
}
