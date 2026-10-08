import { IsString, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateGoalDto {
  @IsString()
  goalName: string;

  @IsNumber()
  @Min(1, { message: 'Target amount must be greater than 0' })
  targetAmount: number;

  @IsNumber()
  @Min(0)
  currentAmount: number;

  @IsDateString({}, { message: 'Target date must be a valid ISO date' })
  targetDate: string;
}
