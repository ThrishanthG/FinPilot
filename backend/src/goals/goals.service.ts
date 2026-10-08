import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        goalName: dto.goalName,
        targetAmount: dto.targetAmount,
        currentAmount: dto.currentAmount,
        targetDate: new Date(dto.targetDate),
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProgress(userId: string, goalId: string, currentAmount: number) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goal.update({
      where: { id: goalId },
      data: { currentAmount },
    });
  }

  async remove(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    await this.prisma.goal.delete({
      where: { id: goalId },
    });

    return { success: true };
  }
}
