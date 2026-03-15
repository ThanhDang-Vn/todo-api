import { Module } from '@nestjs/common';
import { EmailTemplateFactory } from './factories/email.factory';
import { EmailNotificationService } from './services/email.service';

@Module({
  providers: [EmailTemplateFactory, EmailNotificationService],
})
export class NotificationsModule {}
