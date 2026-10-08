import { IsEnum, IsNumber, Min, IsDateString } from 'class-validator';
import { InvestmentType } from '../../common/prisma-enums';

export class CreateInvestmentDto {
  @IsEnum(InvestmentType, { message: 'Must be a valid investment type' })
  investmentType: InvestmentType;

  @IsNumber()
  @Min(1, { message: 'Investment amount must be greater than 0' })
  amount: number;

  @IsDateString({}, { message: 'Date must be a valid ISO date' })
  date: string;
}
