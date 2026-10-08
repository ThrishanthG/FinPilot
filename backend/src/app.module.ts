import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { GoalsModule } from './goals/goals.module';
import { InvestmentsModule } from './investments/investments.module';
import { MarketDataModule } from './market-data/market-data.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
import { APP_GUARD } from '@nestjs/core';
import { RateLimiterGuard } from './common/guards/rate-limiter.guard';

const isStandalone = process.env.STANDALONE === 'true';

// In standalone mode, point to the SQLite dev.db unless DATABASE_URL is already overridden
if (isStandalone && !process.env.DATABASE_URL) {
  const path = require('path');
  process.env.DATABASE_URL = `file:${path.resolve(__dirname, '../../prisma/dev.db')}`;
}

const importsArray: any[] = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env.local', '.env'],
  }),
  AuthModule,
  UsersModule,
  AssessmentsModule,
  GoalsModule,
  InvestmentsModule,
  MarketDataModule,
  ChatModule,
  AdminModule,
];

if (!isStandalone) {
  importsArray.push(
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const redisUrlString = config.get<string>('REDIS_URL') || 'redis://localhost:6379';
        try {
          const parsed = new URL(redisUrlString);
          return {
            connection: {
              host: parsed.hostname || 'localhost',
              port: parseInt(parsed.port || '6379', 10),
              username: parsed.username || undefined,
              password: parsed.password || undefined,
            },
          };
        } catch (e) {
          // Fallback if URL parsing fails
          return {
            connection: {
              host: 'localhost',
              port: 6379,
            },
          };
        }
      },
      inject: [ConfigService],
    })
  );
}

@Module({
  imports: importsArray,
  controllers: [AppController],
  providers: [
    PrismaService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}
