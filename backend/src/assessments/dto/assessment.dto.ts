import { IsNumber, IsString, IsBoolean, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class PersonalInfoDto {
  @IsString()
  gender: string;

  @IsString()
  occupation: string;

  @IsString()
  employmentStatus: string;

  @IsNumber()
  @Min(0)
  monthlyIncome: number;

  @IsNumber()
  @Min(0)
  annualIncome: number;

  @IsString()
  city: string;

  @IsString()
  country: string;
}

class FinancialInfoDto {
  @IsNumber()
  @Min(0)
  currentSavings: number;

  @IsNumber()
  @Min(0)
  existingInvestments: number;

  @IsNumber()
  @Min(0)
  monthlyExpenses: number;

  @IsNumber()
  @Min(0)
  debtInformation: number;

  @IsBoolean()
  emergencyFundStatus: boolean;
}

class QuestionnaireDto {
  @IsBoolean()
  priorInvesting: boolean;

  @IsNumber()
  @Min(0)
  experienceYears: number;

  @IsString()
  knowledgeLevel: string; // Beginner, Intermediate, Advanced

  @IsString()
  riskComfort: string; // Low, Moderate, High

  @IsString()
  investmentGoal: string; // Wealth Creation, Retirement, Education, House Purchase, Passive Income

  @IsNumber()
  @Min(1)
  @Max(50)
  horizonYears: number;
}

export class AssessmentDto {
  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;

  @IsObject()
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @IsObject()
  @ValidateNested()
  @Type(() => FinancialInfoDto)
  financialInfo: FinancialInfoDto;

  @IsObject()
  @ValidateNested()
  @Type(() => QuestionnaireDto)
  questionnaire: QuestionnaireDto;
}
