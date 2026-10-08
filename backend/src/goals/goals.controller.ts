import { Controller, Post, Get, Put, Delete, Body, Req, Param, UseGuards, ParseFloatPipe } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Post()
  async create(@Body() dto: CreateGoalDto, @Req() req: any) {
    const userId = req.user.id;
    return this.goalsService.create(userId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.goalsService.findAll(userId);
  }

  @Put(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body('currentAmount') currentAmount: number,
    @Req() req: any
  ) {
    const userId = req.user.id;
    return this.goalsService.updateProgress(userId, id, currentAmount);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.goalsService.remove(userId, id);
  }
}
