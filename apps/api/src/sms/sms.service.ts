import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  private apiKey = process.env.SPARROW_SMS_API_KEY ?? '';
  private senderId = process.env.SPARROW_SMS_SENDER_ID ?? 'SAHAKARI';
  private apiUrl =
    process.env.SPARROW_SMS_API_URL ?? 'https://api.sparrowsms.com/v1';

  async send(phone: string, message: string): Promise<void> {
    if (!this.apiKey) {
      console.log(`[SMS] Would send to ${phone}: ${message}`);
      return;
    }

    try {
      await fetch(`${this.apiUrl}/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${this.apiKey}`,
        },
        body: JSON.stringify({
          sender_id: this.senderId,
          to: phone.replace(/^\+/, ''),
          text: message,
        }),
      });
    } catch (err) {
      console.error('SMS send failed:', err);
    }
  }
}
