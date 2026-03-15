import { Injectable } from '@nestjs/common';
import { Card, User } from '@prisma/client';

export enum EmailTemplateType {
  TASK_OVERDUE = 'TASK_OVERDUE',
  TASK_REMINDER = 'TASK_REMINDER',
}

export interface EmailContent {
  subject: string;
  html: string;
}

@Injectable()
export class EmailTemplateFactory {
  createTemplate(
    type: EmailTemplateType,
    payload: { card: Card; user: User },
  ): EmailContent {
    const { card, user } = payload;
    const dueDateStr = new Date(card.dueTo).toLocaleString('en-US');

    switch (type) {
      case EmailTemplateType.TASK_OVERDUE:
        return {
          subject: `[Action Required] Task "${card.title}" is overdue!`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2>Hello ${user.firstName || 'there'},</h2>
              <p>This is an automated notification to inform you that your card <strong>"${card.title}"</strong> has missed its deadline.</p>
              <ul>
                <li><strong>Deadline:</strong> ${dueDateStr}</li>
                <li><strong>Priority:</strong> ${card.priority}</li>
              </ul>
              <p>Please review and update the card status in your workspace.</p>
              <br/>
              <a href="https://your-app-domain.com/inbox" style="background-color: #ef4444; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
              <p style="margin-top: 20px; font-size: 12px; color: #777;">Regards,<br/>Todo Deluxe Team</p>
            </div>
          `,
        };

      case EmailTemplateType.TASK_REMINDER:
        return {
          subject: `[Reminder] Task "${card.title}" is due soon`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2>Hello ${user.firstName || 'there'},</h2>
              <p>Just a quick reminder that your card <strong>"${card.title}"</strong> is approaching its deadline.</p>
              <p>Keep up the good work!</p>
            </div>
          `,
        };

      default:
        throw new Error('Invalid email template type provided.');
    }
  }
}
