import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: to,
        subject: 'Secure Login Code - Todo Deluxe',
        html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333; }
        .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea; }
        .content { padding: 30px 20px; background-color: #ffffff; }
        .otp-box { background-color: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b; margin: 0; font-family: monospace; }
        .footer { text-align: center; font-size: 12px; color: #888888; padding-top: 20px; border-top: 1px solid #eaeaea; }
        .warning { font-size: 13px; color: #666666; margin-top: 20px; }
      </style>
    </head>
    <body style="background-color: #f9fafb; padding: 40px 0; margin: 0;">
      <div class="container">
        <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
          
          <div class="header">
            <h2 style="margin: 0; color: #18181b; font-size: 20px; font-weight: 600;">Todo Deluxe</h2>
          </div>

          <div class="content">
            <h1 style="font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #111;">Password Reset Request</h1>
            <p style="font-size: 15px; line-height: 24px; margin: 0 0 16px;">
              We received a request to reset the password for your <strong>Todo Deluxe</strong> account. 
              Please use the verification code below to proceed.
            </p>

            <div class="otp-box">
              <p class="otp-code">${otp}</p>
            </div>

            <p style="font-size: 14px; line-height: 22px; color: #555;">
              This code will expire in <strong>5 minutes</strong>. If you did not request a password reset, you can safely ignore this email. Your account remains secure.
            </p>
          </div>

          <div style="padding: 20px; background-color: #fafafa; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} Todo Deluxe Inc. All rights reserved.</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #aaa;">This is an automated message, please do not reply.</p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
      throw err;
    }
  }
}
