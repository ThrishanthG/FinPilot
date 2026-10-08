import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let redisService: RedisService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
  };

  const mockRedis = {
    isUserLocked: jest.fn(),
    incrementLoginFailures: jest.fn(),
    resetLoginFailures: jest.fn(),
    lockUser: jest.fn(),
  };

  const mockJwt = {
    sign: jest.fn(() => 'mocked_token'),
    verify: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'access_secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user with disclaimer consent', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user_1',
        name: 'Aarav Sharma',
        email: 'aarav@company.com',
        role: 'USER',
      });

      const result = await service.register({
        name: 'Aarav Sharma',
        email: 'aarav@company.com',
        password: 'secure_password_123',
        consentedToDisclaimer: true,
      });

      expect(result).toBeDefined();
      expect(result.email).toBe('aarav@company.com');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should fail if email is already registered', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing_id' });

      await expect(
        service.register({
          name: 'Aarav Sharma',
          email: 'aarav@company.com',
          password: 'secure_password_123',
          consentedToDisclaimer: true,
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user account is locked', async () => {
      mockRedis.isUserLocked.mockResolvedValue(true);

      await expect(
        service.login({
          email: 'locked@company.com',
          password: 'password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
