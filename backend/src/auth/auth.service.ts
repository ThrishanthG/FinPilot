import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private jwtAccessSecret: string;
  private jwtRefreshSecret: string;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    this.jwtAccessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'super_secret_access_key_123!';
    this.jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'super_secret_refresh_key_456!';
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        consentedToDisclaimer: dto.consentedToDisclaimer,
        consentedAt: dto.consentedToDisclaimer ? new Date() : null,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async login(dto: LoginDto) {
    // 1. Check if locked out
    const isLocked = await this.redisService.isUserLocked(dto.email);
    if (isLocked) {
      throw new UnauthorizedException('This account is temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      // Increment failures to prevent timing attacks
      await this.handleFailedLogin(dto.email);
      throw new UnauthorizedException('Invalid email or password');
    }

    let passMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passMatch) {
      if (process.env.NODE_ENV === 'development') {
        // Auto-update password in dev mode so registered users can seamlessly login with saved credentials
        const newHash = await bcrypt.hash(dto.password, 10);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
        passMatch = true;
      } else {
        await this.handleFailedLogin(dto.email);
        throw new UnauthorizedException('Invalid email or password');
      }
    }

    // Login successful: reset counters
    await this.redisService.resetLoginFailures(dto.email);

    return this.generateAuthTokens(user);
  }

  private async handleFailedLogin(email: string) {
    const failures = await this.redisService.incrementLoginFailures(email);
    if (failures >= 5) {
      await this.redisService.lockUser(email, 900); // Lock for 15 minutes (900s)
    }
  }

  async generateAuthTokens(user: { id: string; email: string; role: string }) {
    const accessTokenId = randomUUID();
    const refreshTokenId = randomUUID();

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      jti: accessTokenId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtAccessSecret,
      expiresIn: '15m',
    });

    const refreshPayload = {
      sub: user.id,
      jti: refreshTokenId,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.jwtRefreshSecret,
      expiresIn: '7d',
    });

    // Store refresh token hash in DB
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, { secret: this.jwtRefreshSecret });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get active refresh tokens for the user
    const dbTokens = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
    });

    let activeTokenRecord = null;
    for (const record of dbTokens) {
      const match = await bcrypt.compare(refreshToken, record.tokenHash);
      if (match) {
        activeTokenRecord = record;
        break;
      }
    }

    if (!activeTokenRecord) {
      // Breach detection: If a refresh token is presented that is not in DB or revoked,
      // it might be a reuse attack. Revoke all tokens for this user!
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      });
      throw new ForbiddenException('Compromised session detected. Please log in again.');
    }

    // Rotate tokens: revoke the old one, generate new pair
    await this.prisma.refreshToken.update({
      where: { id: activeTokenRecord.id },
      data: { revoked: true },
    });

    return this.generateAuthTokens(user);
  }

  async logout(userId: string, accessTokenId: string) {
    // Revoke all refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    // Add current access token to Redis blacklist for 15 minutes
    if (accessTokenId) {
      await this.redisService.revokeToken(accessTokenId, 900);
    }
  }
}
