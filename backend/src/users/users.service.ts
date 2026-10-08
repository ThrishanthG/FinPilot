import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('assessment-queue') private assessmentQueue: Queue
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name ?? user.name,
        age: dto.age ?? user.age,
        occupation: dto.occupation ?? user.occupation,
        monthlyIncome: dto.monthlyIncome !== undefined ? dto.monthlyIncome : user.monthlyIncome,
        annualIncome: dto.annualIncome !== undefined ? dto.annualIncome : user.annualIncome,
      },
    });

    // If age, monthlyIncome, or annualIncome changed, trigger a background risk-score recalculation.
    // Fetch latest assessment answers to reuse them.
    const latestAssessment = await this.prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (latestAssessment && (dto.age !== undefined || dto.monthlyIncome !== undefined)) {
      const answers = latestAssessment.answers as any;
      
      // Update variables inside assessment answers context
      if (dto.age !== undefined) answers.age = dto.age;
      if (dto.monthlyIncome !== undefined) answers.personalInfo.monthlyIncome = dto.monthlyIncome;
      if (dto.annualIncome !== undefined) answers.personalInfo.annualIncome = dto.annualIncome;

      // Add task to queue
      await this.assessmentQueue.add('calculate-risk', {
        userId,
        assessmentData: answers,
      });
      console.log(`Profile edit detected for user ${userId}. Recalculation task queued.`);
    }

    return {
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        monthlyIncome: updatedUser.monthlyIncome,
        annualIncome: updatedUser.annualIncome
      }
    };
  }

  async deleteUserData(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    // Delete user (cascade settings in schema will delete assessments, investments, goals, tokens)
    await this.prisma.user.delete({ where: { id: userId } });
    
    return {
      message: 'Your account and all associated financial data have been permanently deleted.'
    };
  }
}
