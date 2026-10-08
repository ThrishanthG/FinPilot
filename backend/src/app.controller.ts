import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService
  ) {}

  @Get('health')
  async getHealth(@Res() res: Response) {
    let dbStatus = 'healthy';
    let redisStatus = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = `unhealthy: ${e.message}`;
    }

    try {
      await this.redisService.getClient().ping();
    } catch (e) {
      redisStatus = `unhealthy: ${e.message}`;
    }

    const healthy = dbStatus === 'healthy' && redisStatus === 'healthy';
    const status = healthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(status).json({
      status: healthy ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    });
  }
}
