import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    
    // Attempt to extract and verify JWT to get user ID
    let userId: string | undefined;
    const token = request.cookies?.access_token || this.extractBearerToken(request);
    
    if (token) {
      try {
        const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'super_secret_access_key_123!';
        const payload = this.jwtService.verify(token, { secret });
        userId = payload.sub;
        
        // Populate request.user so subsequent guards/controllers have access immediately
        if (!request.user) {
          request.user = { id: payload.sub, email: payload.email, role: payload.role, tokenId: payload.jti };
        }
      } catch (e) {
        // Ignore token verification errors (user will be treated as guest/IP rate-limited)
      }
    }
    
    // Key based on user or IP
    const limiterKey = userId ? `rate_limit:user:${userId}` : `rate_limit:ip:${ip}`;
    
    // Default limit: 60 requests per minute
    const limit = 60;
    const windowSeconds = 60;
    
    const isLimited = await this.redisService.isRateLimited(limiterKey, limit, windowSeconds);
    if (isLimited) {
      throw new HttpException('Too Many Requests. Please slow down.', HttpStatus.TOO_MANY_REQUESTS);
    }
    
    return true;
  }

  private extractBearerToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
