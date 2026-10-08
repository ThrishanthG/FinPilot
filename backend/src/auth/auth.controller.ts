import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService
  ) {}

  private setCookie(res: Response, name: string, value: string, maxAgeMs: number) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAgeMs,
      path: '/'
    });
  }

  private clearCookie(res: Response, name: string) {
    res.clearCookie(name, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(dto);
    
    // Set Cookies
    this.setCookie(res, 'access_token', tokens.accessToken, 15 * 60 * 1000); // 15 min
    this.setCookie(res, 'refresh_token', tokens.refreshToken, 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, name: true, email: true, role: true, riskScore: true, consentedToDisclaimer: true }
    });

    return { user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Refresh token not found' });
    }

    try {
      const tokens = await this.authService.refresh(refreshToken);
      this.setCookie(res, 'access_token', tokens.accessToken, 15 * 60 * 1000);
      this.setCookie(res, 'refresh_token', tokens.refreshToken, 7 * 24 * 60 * 60 * 1000);
      return { success: true };
    } catch (error) {
      this.clearCookie(res, 'access_token');
      this.clearCookie(res, 'refresh_token');
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user.id;
    const accessTokenId = req.user.tokenId;
    
    await this.authService.logout(userId, accessTokenId);
    
    this.clearCookie(res, 'access_token');
    this.clearCookie(res, 'refresh_token');
    
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        occupation: true,
        monthlyIncome: true,
        annualIncome: true,
        riskScore: true,
        experienceScore: true,
        financialLiteracyScore: true,
        consentedToDisclaimer: true,
        consentedAt: true,
      }
    });
    return { user };
  }
}
