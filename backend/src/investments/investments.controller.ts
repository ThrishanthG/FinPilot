import { Controller, Post, Get, Delete, Body, Req, Param, UseGuards } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private investmentsService: InvestmentsService) {}

  @Post()
  async create(@Body() dto: CreateInvestmentDto, @Req() req: any) {
    const userId = req.user.id;
    return this.investmentsService.create(userId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.investmentsService.findAll(userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.investmentsService.remove(userId, id);
  }
}
