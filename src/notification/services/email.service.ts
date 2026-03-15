import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { INotification } from '../interfaces/notification.interface';
import {
  EmailTemplateFactory,
  EmailTemplateType,
} from '../factories/email.factory';
import { Card, User } from '@prisma/client';

@Injectable()
export class EmailNotificationService implements INotification {
  private transporter;
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(private readonly templateFactory: EmailTemplateFactory) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  @OnEvent('card.overdue')
  async handleTaskOverdue(payload: { card: Card; user: User }) {
    if (!payload.user?.email) return;
    await this.send(payload.card, payload.user);
  }

  async send(card: Card, user: any): Promise<boolean> {
    try {
      const content = this.templateFactory.createTemplate(
        EmailTemplateType.TASK_OVERDUE,
        { card, user },
      );

      await this.transporter.sendMail({
        from: '"Todo Deluxe Notifications" <no-reply@tododeluxe.com>',
        to: user.email,
        subject: content.subject,
        html: content.html,
      });

      this.logger.log(
        `Successfully sent email notification to ${user.email} for task ${card.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${user.email}: ${error.message}`,
      );
      return false;
    }
  }
}
