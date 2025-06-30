import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { UserEventController } from './user_events.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  controllers: [UserEventController],
  imports: [
    // Register a Bull queue for notifications (or other background tasks)
    BullModule.registerQueue({
      name: 'notification',
    }),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.REDIS,
        options: { host: 'localhost', port: 6379 },
      },
    ]),
  ],
})
export class UserEventModule {}

// constructor(private readonly appService: AppService) {}
// constructor(
//   private readonly appService: AppService,
//   @Inject('MATCH_SERVICE') private readonly matchServiceClient: ClientProxy,
//   @Inject('NOTIFICATION_SERVICE')
//   private readonly notificationServiceClient: ClientProxy,
// ) {}
