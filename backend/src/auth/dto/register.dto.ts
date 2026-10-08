import { IsEmail, IsString, MinLength, IsBoolean, Equals } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsBoolean()
  @Equals(true, { message: 'You must consent to the SEBI educational advisory disclaimer to proceed' })
  consentedToDisclaimer: boolean;
}
