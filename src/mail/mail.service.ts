import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      const response = await this.resend.emails.send({
        from: this.configService.getOrThrow<string>('EMAIL_FROM'),
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      this.logger.log(
        `Email sent successfully to ${params.to}`,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        `Error while sending email to ${params.to}`,
        error,
      );
    }
  }
}