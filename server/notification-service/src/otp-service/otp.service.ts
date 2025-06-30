import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID; // Replace with your SID
    const authToken = process.env.TWILIO_AUTH_TOKEN; // Replace with your Auth Token
    this.client = Twilio(accountSid, authToken);
  }

  async sendOTP(to: string, otp: string): Promise<void> {
    try {
      const message = await this.client.messages.create({
        body: `Your OTP code for login into cupid is: ${otp} make sure dont share this otp with others`,
        from: process.env.TWILIO_PHONE_NUMBER, // Replace with your Twilio number
        to, // User's phone number
      });
      console.log(`OTP sent: ${message.sid}`);
    } catch (error) {
      console.error('Failed to send OTP via Twilio:', error.message);
      throw new Error('Failed to send OTP');
    }
  }
}
