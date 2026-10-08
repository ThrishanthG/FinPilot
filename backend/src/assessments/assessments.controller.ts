import { Controller, Post, Get, Body, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentDto } from './dto/assessment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('assessments')
@UseGuards(JwtAuthGuard)
export class AssessmentsController {
  constructor(
    private assessmentsService: AssessmentsService,
    private prisma: PrismaService
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async submit(@Body() dto: AssessmentDto, @Req() req: any) {
    const userId = req.user.id;
    return this.assessmentsService.submitAssessment(userId, dto);
  }

  @Get('latest')
  async getLatest(@Req() req: any) {
    const userId = req.user.id;
    const assessment = await this.assessmentsService.getLatestAssessment(userId);
    return { assessment };
  }

  @Get('suggestions')
  async getSuggestions(@Req() req: any) {
    const userId = req.user.id;
    
    // Fetch user details for scoring profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { age: true, riskScore: true }
    });

    const assessment = await this.assessmentsService.getLatestAssessment(userId);
    if (!assessment) {
      return {
        message: 'No assessment found. Please complete the onboarding questionnaire.',
        suggestedAllocation: null
      };
    }

    let answers = assessment.answers;
    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers);
      } catch (e) {
        answers = {} as any;
      }
    }
    const answersObj = answers as any;
    const goal = answersObj?.questionnaire?.investmentGoal || 'Wealth Creation';
    const horizon = answersObj?.questionnaire?.horizonYears || 5;

    const allocationData = await this.assessmentsService.getSuggestedModelAllocation(
      assessment.riskLevel as any,
      user?.age || 30,
      horizon,
      goal
    );

    return {
      suggestedAllocation: allocationData.allocation,
      explanation: allocationData.explanation,
      riskLevel: assessment.riskLevel
    };
  }
}
