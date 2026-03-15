import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CardScheduleService {
  private readonly logger = new Logger(CardScheduleService.name);
  constructor(
    private prisma: PrismaService,
    private readonly evenEmiter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkOverCard() {
    const now = new Date();

    const overdueCards = await this.prisma.card.findMany({
      where: {
        dueTo: {
          lte: now,
        },
        isNotified: false,
      },
      include: {
        user: true,
      },
    });

    if (overdueCards.length === 0) return;

    this.logger.log(
      `Found ${overdueCards.length} tasks have been expired and need to send notification.`,
    );

    for (const overdueCard of overdueCards) {
      await this.prisma.card.update({
        where: {
          id: overdueCard.id,
        },
        data: {
          isNotified: true,
        },
      });

      this.evenEmiter.emit('card.overdue', {
        card: overdueCard,
        user: overdueCard.user,
      });
    }
  }
}
