import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { TemplateService } from './templates.service';

@Module({
  controllers: [MailController],
  exports: [MailService, TemplateService],
  providers: [MailService, TemplateService],
})
export class MailModule { }
