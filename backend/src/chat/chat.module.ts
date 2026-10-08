import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController, FinbotController } from './chat.controller';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ChatController, FinbotController],
  providers: [ChatService, RedisService, PrismaService],
  exports: [ChatService]
})
export class ChatModule {}
