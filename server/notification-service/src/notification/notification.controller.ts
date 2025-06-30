import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller()
export class NotificationController {
  constructor(
    @InjectQueue('email-queue')
    private readonly emailQueue: Queue,
    @InjectQueue('otp-queue')
    private readonly otpQueue: Queue,
  ) {}

  @EventPattern('send_email')
  async handleSendEmail(payload: {
    to: string;
    subject: string;
    activationLink?: string;
  }) {
    try {
      await this.emailQueue.add('send-email-job', payload, {
        attempts: 3,
        backoff: 5000,
      });
      return { status: 'success', message: 'Email sent successfully!' };
    } catch (error) {
      console.error('Failed to add job to queue:', error.message);
      return { status: 'error', message: error.message };
    }
  }

  @EventPattern('send_otp')
  async handleOtp(payload: { phone: string; otp: string }) {
    try {
      await this.otpQueue.add('send-otp-job', payload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      });
      console.log('OTP job added to queue:', payload);

      return { message: `Otp send to ${payload.phone}` };
    } catch (error) {
      console.error('Failed to add OTP job to queue:', error);
    }
  }
}
