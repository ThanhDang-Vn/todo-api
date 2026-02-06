import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCardDto) {
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

    return await this.prisma.card.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        priority: dto.priority || 'medium',
        dueTo: dto.dateDue || new Date(),
        columnId: dto.columnId,
        order: order,
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

    return await this.prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        completeAt: new Date(),
      },
    });
  }

  async getCompleteCards() {
    const cards = await this.prisma.card.findMany({
      where: {
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

    return await this.prisma.card.update({
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
  }

  async deleteReminder(reminderId: string) {
    return await this.prisma.reminder.delete({
      where: {
        id: reminderId,
      },
    });
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

    return await this.prisma.card.update({
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

    return await this.prisma.card.delete({
      where: {
        id: cardId,
      },
    });
  }
}
