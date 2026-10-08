import { OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RiskLevel } from '../common/prisma-enums';
import { QueueModule } from '../common/queue.module';

const isStandalone = process.env.STANDALONE === 'true';

// In standalone mode, extend a no-op base class instead of BullMQ's WorkerHost
// so we don't need an active Redis connection.
let BaseClass: any = class {};
let ProcessorDecorator: ClassDecorator = () => {};

if (!isStandalone) {
  // Lazily require so the modules aren't even loaded in standalone mode
  const bullmq = require('@nestjs/bullmq');
  BaseClass = bullmq.WorkerHost;
  ProcessorDecorator = bullmq.Processor('assessment-queue');
}

// @ts-ignore — decorator applied below conditionally
@ProcessorDecorator
export class AssessmentsProcessor extends BaseClass implements OnModuleInit {
  private mlServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    super();
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
  }

  onModuleInit() {
    if (isStandalone) {
      QueueModule.emitter.on('assessment-queue', async (job: any) => {
        console.log(`[Standalone Processor] Processing job: ${job.name}`);
        await this.process(job);
      });
    }
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { userId, assessmentData } = job.data;
    
    let riskScore = 50;
    let riskLevel: RiskLevel = 'MODERATE';
    let experienceScore = 50;
    let financialLiteracyScore = 50;
    
    // Attempt calling Python FastAPI ML service
    try {
      const payload = {
        age: assessmentData.age,
        experience_years: assessmentData.questionnaire.experienceYears,
        knowledge_level: assessmentData.questionnaire.knowledgeLevel,
        risk_comfort: assessmentData.questionnaire.riskComfort,
        savings_ratio: assessmentData.financialInfo.currentSavings / (assessmentData.personalInfo.monthlyIncome || 1),
        horizon_years: assessmentData.questionnaire.horizonYears
      };

      const response = await fetch(`${this.mlServiceUrl}/api/v1/ml/predict-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const mlResult = await response.json();
        riskScore = mlResult.risk_score;
        riskLevel = mlResult.risk_level as RiskLevel;
        experienceScore = mlResult.literacy_score; // map literacy
        financialLiteracyScore = mlResult.stability_score; // map stability
        console.log(`ML Risk classification successful for user ${userId}: Score=${riskScore}, Level=${riskLevel}`);
      } else {
        throw new Error(`FastAPI response code: ${response.status}`);
      }
    } catch (e) {
      console.warn(`ML Service error: ${e.message}. Running fallback rules-based calculator.`);
      
      // Fallback Rules Engine
      const comfort = assessmentData.questionnaire.riskComfort; // Low, Moderate, High
      const knowledge = assessmentData.questionnaire.knowledgeLevel; // Beginner, Intermediate, Advanced
      const horizon = assessmentData.questionnaire.horizonYears;
      
      let score = 50;
      if (comfort === 'High') score += 25;
      else if (comfort === 'Low') score -= 20;
      
      if (knowledge === 'Advanced') score += 15;
      else if (knowledge === 'Beginner') score -= 15;
      
      if (horizon > 10) score += 10;
      else if (horizon < 3) score -= 10;

      riskScore = Math.max(0, Math.min(100, score));
      if (riskScore < 40) riskLevel = 'CONSERVATIVE';
      else if (riskScore > 70) riskLevel = 'AGGRESSIVE';
      else riskLevel = 'MODERATE';
      
      experienceScore = assessmentData.questionnaire.priorInvesting ? 70 : 30;
      financialLiteracyScore = knowledge === 'Advanced' ? 90 : (knowledge === 'Intermediate' ? 65 : 40);
    }

    // Save calculations to User Profile
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        riskScore,
        experienceScore,
        financialLiteracyScore,
      }
    });

    // Save Assessment Snapshot
    const assessment = await this.prisma.assessment.create({
      data: {
        userId,
        answers: isStandalone ? JSON.stringify(assessmentData) : (assessmentData as any),
        riskLevel,
      }
    });

    return {
      userId,
      assessmentId: assessment.id,
      riskScore,
      riskLevel
    };
  }
}

