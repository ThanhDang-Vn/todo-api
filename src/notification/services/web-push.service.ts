// import { Injectable, Logger } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
// import * as webpush from 'web-push';
// import { INotification } from '../interfaces/notification.interface';

// @Injectable()
// export class WebPushNotificationService implements INotification {
//   private readonly logger = new Logger(WebPushNotificationService.name);

//   constructor() {
//     webpush.setVapidDetails(
//       'mailto:admin@tododeluxe.com',
//       process.env.VAPID_PUBLIC_KEY,
//       process.env.VAPID_PRIVATE_KEY,
//     );
//   }

//   @OnEvent('task.overdue')
//   async handleTaskOverdue(payload: { task: any; user: any }) {
//     await this.send(payload.task, payload.user);
//   }

//   async send(task: any, user: any): Promise<boolean> {
//     const sub = user.webPushSubscription;
//     if (!sub) {
//       this.logger.debug(`User ${user.id} has no web push subscription.`);
//       return false;
//     }

//     try {
//       const payload = JSON.stringify({
//         title: 'Task Overdue!',
//         body: `Your task "${task.title}" has missed its deadline.`,
//         url: '/inbox',
//       });

//       // parse subscription string nếu nó đang lưu dưới dạng text trong DB
//       const subscriptionObj = typeof sub === 'string' ? JSON.parse(sub) : sub;

//       await webpush.sendNotification(subscriptionObj, payload);
//       this.logger.log(
//         `Successfully sent Web Push to user ${user.id} for task ${task.id}`,
//       );
//       return true;
//     } catch (error) {
//       this.logger.error(`Failed to send Web Push: ${error.message}`);
//       // Nếu user thu hồi quyền, web-push sẽ ném lỗi 410. Bạn có thể xóa subscription khỏi DB tại đây.
//       return false;
//     }
//   }
// }
