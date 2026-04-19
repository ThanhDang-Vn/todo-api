/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from '../dto/create-card.dto';
import { UpdateCardDto } from '../dto/update-card.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class CardService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private readonly REDIS_TTL = 300;

  private cacheKey = {
    today: (uid: string) => `cards:today:${uid}`,
    upcoming: (uid: string) => `cards:upcoming:${uid}`,
    inbox: (uid: string) => `cards:inbox:${uid}`,
  };

  private async invalidateUserCaches(userId: string): Promise<void> {
    await this.redis.del(
      this.cacheKey.today(userId),
      this.cacheKey.upcoming(userId),
      this.cacheKey.inbox(userId),
    );
  }

  private formatDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatColumnTitle(
    date: Date,
    isToday: boolean,
    isTomorrow: boolean,
  ): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const dayOfMonth = date.getDate();
    const monthStr = months[date.getMonth()];

    if (isToday) return `${dayOfMonth} ${monthStr} • Today`;
    if (isTomorrow) return `${dayOfMonth} ${monthStr} • Tomorrow`;

    return `${dayOfMonth} ${monthStr} • ${days[date.getDay()]}`;
  }

  async create(dto: CreateCardDto, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found or access denied');
    }

    let order: number;

    if (dto.order !== undefined) {
      order = dto.order;
    } else {
      const lastCard = await this.prisma.card.findFirst({
        where: {
          columnId: dto.columnId,
        },
        orderBy: { order: 'desc' },
      });

      order = lastCard ? lastCard.order + 10000 : 10000;
    }

    const newCard = await this.prisma.card.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        priority: dto.priority || 'medium',
        dueTo: dto.dateDue || new Date(),
        columnId: dto.columnId,
        order: order,
        userId: userId,
        reminders: {
          create:
            dto.reminders?.map((reminder) => ({
              remindAt: reminder.remindAt,
            })) || [],
        },
      },
      include: {
        reminders: true,
      },
    });

    await this.invalidateUserCaches(userId);
    return newCard;
  }

  async complete(cardId: string) {
    const card = await this.prisma.card.findUnique({
      where: {
        id: cardId,
      },
    });

    if (!card) {
      throw new Error('Card is not exist');
    }

    const updated = await this.prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        completeAt: new Date(),
      },
    });

    if (card.userId) await this.invalidateUserCaches(card.userId);
    return updated;
  }

  async getCompleteCards(userId: string) {
    const cards = await this.prisma.card.findMany({
      where: {
        userId: userId,
        completeAt: {
          not: null,
        },
      },
      include: {
        column: true,
      },
      orderBy: {
        completeAt: 'desc',
      },
    });

    const getMonday = (d: Date): string => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);

      return new Date(date.setDate(diff)).toISOString().split('T')[0];
    };

    const groupedDict = cards.reduce(
      (acc, card) => {
        if (!card || !card?.completeAt) return acc;

        const weekKey = getMonday(card.completeAt);

        if (!acc[weekKey]) {
          acc[weekKey] = [];
        }

        acc[weekKey].push(card);

        return acc;
      },
      {} as Record<string, typeof cards>,
    );

    const grouped = Object.entries(groupedDict).map(([time, cards]) => ({
      time,
      cards,
    }));

    return grouped;
  }

  async getTodayCards(userId: string) {
    const key = this.cacheKey.today(userId);
    const cached = await this.redis.get(key);
    if (cached) return cached;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const cardsOfToday = await this.prisma.card.findMany({
      where: {
        userId: userId,
        dueTo: {
          gte: startOfDay,
          lte: endOfDay,
        },
        completeAt: null,
      },

      orderBy: { order: 'asc' },
      include: {
        reminders: {
          orderBy: {
            remindAt: 'asc',
          },
        },
      },
    });

    const cardsDueTo = await this.prisma.card.findMany({
      where: {
        userId: userId,
        dueTo: {
          lt: startOfDay,
        },
      },
    });

    const res = [
      {
        id: '1',
        title: 'Overdue',
        cards: cardsDueTo ?? [],
      },
      {
        id: '2',
        title: 'Today',
        cards: cardsOfToday ?? [],
      },
    ];

    await this.redis.set(key, res, this.REDIS_TTL);
    return res;
  }

  async getUpcommingCards(userId: string) {
    const key = this.cacheKey.upcoming(userId);
    const cached = await this.redis.get(key);

    if (cached) return cached;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDayOfWeek = today.getDay();
    const daysDiff = (7 - currentDayOfWeek) % 7;

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + daysDiff);
    endOfWeek.setHours(23, 59, 59, 999);

    const cards = await this.prisma.card.findMany({
      where: {
        userId: userId,
        completeAt: null,
        dueTo: {
          gte: today,
          lte: endOfWeek,
        },
      },
      orderBy: { order: 'asc' },
      include: {
        reminders: {
          orderBy: {
            remindAt: 'asc',
          },
        },
      },
    });

    const columns: Array<{
      id: string;
      title: string;
      _matchDate: string;
      cards: any[];
    }> = [];
    const loopDate = new Date(today);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    while (loopDate <= endOfWeek) {
      const dateString = this.formatDateStr(loopDate);

      const isToday = loopDate.getTime() === today.getTime();
      const isTomorrow = loopDate.getTime() === tomorrow.getTime();

      columns.push({
        id: `${dateString}`,
        title: this.formatColumnTitle(loopDate, isToday, isTomorrow),
        _matchDate: dateString,
        cards: [],
      });

      loopDate.setDate(loopDate.getDate() + 1);
    }

    for (const card of cards) {
      if (!card.dueTo) continue;

      const cardDateStr = this.formatDateStr(card.dueTo);
      const targetColumn = columns.find(
        (col) => col._matchDate === cardDateStr,
      );

      if (targetColumn) {
        targetColumn.cards.push(card);
      }
    }

    const res = columns.map(({ _matchDate, ...cleanColumn }) => cleanColumn);

    await this.redis.set(key, res, this.REDIS_TTL);

    return res;
  }

  async getInboxCards(userId: string) {
    const key = this.cacheKey.inbox(userId);
    const cached = await this.redis.get(key);
    if (cached) return cached;
    const res = await this.prisma.column.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        cards: {
          where: {
            completeAt: null,
          },
          orderBy: { order: 'asc' },
          include: {
            reminders: {
              orderBy: {
                remindAt: 'asc',
              },
            },
          },
        },
      },
    });

    await this.redis.set(key, res, this.REDIS_TTL);

    return res;
  }

  async updateReminder(remind: string, cardId: string) {
    const card = await this.prisma.card.findUnique({
      where: {
        id: cardId,
      },
      include: {
        reminders: true,
      },
    });

    if (!card) {
      throw new Error('Card does not exist');
    }

    const updated = await this.prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        reminders: {
          create: {
            remindAt: remind,
          },
        },
      },
      include: {
        reminders: true,
      },
    });

    if (card.userId) await this.invalidateUserCaches(card.userId);
    return updated;
  }

  async deleteReminder(reminderId: string) {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id: reminderId },
      include: { card: { select: { userId: true } } },
    });

    const deleted = await this.prisma.reminder.delete({
      where: { id: reminderId },
    });

    if (reminder?.card?.userId) {
      await this.invalidateUserCaches(reminder.card.userId);
    }
    return deleted;
  }

  async update(cardId: string, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({
      where: {
        id: cardId,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found or access denied');
    }

    let order: number = card.order;

    if (dto.columnId) {
      if (dto.order !== undefined) {
        order = dto.order;
      } else {
        const lastCard = await this.prisma.card.findFirst({
          where: {
            columnId: dto.columnId,
          },
          orderBy: { order: 'desc' },
        });

        order = lastCard ? lastCard.order + 10000 : 10000;
      }
    }

    const updated = await this.prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        ...dto,
        updatedAt: new Date(),
        order: dto.columnId ? order : card.order,
      },
      include: {
        column: true,
      },
    });

    if (card.userId) await this.invalidateUserCaches(card.userId);
    return updated;
  }

  async delete(cardId: string) {
    const card = await this.prisma.card.findUnique({
      where: {
        id: cardId,
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found or access denied');
    }

    const deleted = await this.prisma.card.delete({
      where: {
        id: cardId,
      },
    });

    if (card.userId) await this.invalidateUserCaches(card.userId);
    return deleted;
  }
}
