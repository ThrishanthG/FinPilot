import { DynamicModule, Module, Global } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { EventEmitter } from 'events';

const isStandalone = process.env.STANDALONE === 'true';

@Global()
@Module({})
export class QueueModule {
  static emitter = new EventEmitter();

  static register(name: string): DynamicModule {
    if (isStandalone) {
      const mockQueue = {
        add: async (jobName: string, data: any) => {
          console.log(`[Standalone Queue] Job added to ${name}: ${jobName}`, data);
          setTimeout(() => {
            QueueModule.emitter.emit(name, { name: jobName, data });
          }, 100);
          return { id: `mock-job-${Date.now()}` };
        },
      };

      return {
        module: QueueModule,
        providers: [
          {
            provide: getQueueToken(name),
            useValue: mockQueue,
          },
        ],
        exports: [getQueueToken(name)],
      };
    } else {
      return {
        module: QueueModule,
        imports: [
          BullModule.registerQueue({
            name,
          }),
        ],
        exports: [BullModule],
      };
    }
  }
}
