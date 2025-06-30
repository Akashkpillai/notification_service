import { MailerService } from './../mailer/mailer.service';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email-queue')
export class EmailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('send-email-job')
  async handleSendEmailJob(
    job: Job<{
      to: string;
      subject: string;
      templateName: string;
      html?: Record<string, any>;
    }>,
  ) {
    const { to, subject, html, templateName } = job.data;

    try {
      // Send the email using MailerService
      await this.mailerService.loadAndSendTemplate(
        to,
        subject,
        templateName,
        html,
      );
      console.log(`Email sent to ${to} successfully!`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error.message);
      throw error; // Throwing ensures the job can be retried if configured
    }
  }
}
