import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token || null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'super_secret_access_key_123!',
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: any) {
    // Check if token has been revoked (e.g. user logged out)
    const tokenId = payload.jti;
    if (tokenId) {
      const isRevoked = await this.redisService.isTokenRevoked(tokenId);
      if (isRevoked) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }
    
    return { id: payload.sub, email: payload.email, role: payload.role, tokenId };
  }
}
