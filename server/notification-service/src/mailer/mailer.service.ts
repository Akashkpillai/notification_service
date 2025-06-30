import { TemplateLoader } from './template-loader';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private readonly templateLoader: TemplateLoader,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: +this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html?: string): Promise<void> {
    try {
      const mailOptions = {
        from: '"Cupid" <akashkpillai55@gmail.com>', // Sender address
        to, // Recipient(s)
        subject, // Email subject
        html, // HTML body (optional)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId);
    } catch (error) {
      console.error('Error sending email: ', error);
      throw error;
    }
  }

  async loadAndSendTemplate(
    to: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
  ) {
    const html = await this.templateLoader.renderTemplate(
      templateName,
      templateData,
    );
    await this.sendMail(to, subject, html);
  }
}
