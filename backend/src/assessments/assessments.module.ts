import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsProcessor } from './assessments.processor';
import { PrismaService } from '../prisma/prisma.service';
import { QueueModule } from '../common/queue.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    QueueModule.register('assessment-queue'),
    ConfigModule,
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AssessmentsProcessor, PrismaService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}

