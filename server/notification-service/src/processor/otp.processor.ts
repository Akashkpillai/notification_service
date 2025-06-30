import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { TwilioService } from 'src/otp-service/otp.service';

@Processor('otp-queue')
export class OtpProcessor {
  constructor(private twilioService: TwilioService) {}

  @Process('send-otp-job')
  async handleSendEmailJob(job: Job<{ phone: string; otp: string }>) {
    const { phone, otp } = job.data;
    try {
      await this.twilioService.sendOTP(phone, otp);
      console.log(`Otp sent to ${phone} successfully!`);
    } catch (error) {
      console.error(`Failed to send OTP to ${phone}:`, error);
      throw error;
    }
  }
}
