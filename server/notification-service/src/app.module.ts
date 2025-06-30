import { Module } from '@nestjs/common';
import { NotificationService } from './notification/notification.service';
import { NotificationController } from './notification/notification.controller';
import { MailerService } from './mailer/mailer.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './processor/email.processor';
import { OtpProcessor } from './processor/otp.processor';
import { TwilioService } from './otp-service/otp.service';
import { TemplateLoader } from './mailer/template-loader';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'email-queue',
      },
      {
        name: 'otp-queue',
      },
    ),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    MailerService,
    EmailProcessor,
    OtpProcessor,
    TwilioService,
    TemplateLoader,
  ],
  exports: [TemplateLoader],
})
export class AppModule {}
