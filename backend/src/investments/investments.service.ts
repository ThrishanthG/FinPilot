import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvestmentsService {
  private mlServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
  }

  async create(userId: string, dto: CreateInvestmentDto) {
    // 1. Save Investment to PostgreSQL
    const investment = await this.prisma.investment.create({
      data: {
        userId,
        investmentType: dto.investmentType,
        amount: dto.amount,
        date: new Date(dto.date),
      },
    });

    // 2. Fetch User Profile & Recent Investments to perform erratic behavior check
    let warning = null;
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { riskScore: true, monthlyIncome: true }
      });

      const recentInvestments = await this.prisma.investment.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 10
      });

      // Deduce risk level
      let riskLevel = 'MODERATE';
      if (user?.riskScore) {
        if (user.riskScore < 40) riskLevel = 'CONSERVATIVE';
        else if (user.riskScore > 70) riskLevel = 'AGGRESSIVE';
      }

      // Map to payload
      const payload = {
        risk_level: riskLevel,
        monthly_income: Number(user?.monthlyIncome || 50000),
        recent_investments: recentInvestments.map(item => ({
          investmentType: item.investmentType,
          amount: Number(item.amount)
        }))
      };

      const mlCheck = await fetch(`${this.mlServiceUrl}/api/v1/ml/detect-erratic-behavior`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (mlCheck.ok) {
        const checkResult = await mlCheck.json();
        if (checkResult.is_erratic && checkResult.warnings?.length > 0) {
          warning = checkResult.warnings[0]; // Fetch top warning
        }
      }
    } catch (e) {
      console.warn('Could not run ML erratic behavior detection check:', e.message);
    }

    return {
      success: true,
      investment,
      warning
    };
  }

  async findAll(userId: string) {
    return this.prisma.investment.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async remove(userId: string, id: string) {
    const investment = await this.prisma.investment.findFirst({
      where: { id, userId },
    });
    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    await this.prisma.investment.delete({
      where: { id },
    });

    return { success: true };
  }
}
