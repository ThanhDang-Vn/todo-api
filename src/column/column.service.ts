import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async getAllColumn(userId: string) {
    return await this.prisma.column.findMany({
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
  }

  async create(dto: createColumnDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let order: number;

    if (dto.order !== undefined) {
      order = dto.order;
    } else {
      const lastColumn = await this.prisma.column.findFirst({
        where: { userId: userId },
        orderBy: { order: 'desc' },
      });

      order = lastColumn ? lastColumn.order + 10000 : 10000;
    }

    return await this.prisma.column.create({
      data: {
        title: dto.title,
        userId: userId,
        order: order,
      },
    });
  }

  async duplicate(columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: {
        id: columnId,
      },
      include: {
        cards: true,
      },
    });

    if (!column) {
      throw new Error('This column is not existed');
    }

    const nearColumn = await this.prisma.column.findFirst({
      where: {
        order: {
          gt: column.order,
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return await this.prisma.$transaction(async (tx) => {
      return await tx.column.create({
        data: {
          title: column.title,
          order: nearColumn
            ? (column.order + (nearColumn?.order || 0)) / 2
            : column.order + 10000,
          userId: column.userId,
          cards: {
            create: column.cards.map((card) => ({
              title: card.title,
              priority: card.priority,
              order: card.order,
              description: card.description,
              dueTo: card.dueTo,
            })),
          },
        },

        include: {
          cards: true,
        },
      });
    });
  }

  async delete(id: string) {
    const column = await this.prisma.column.findUnique({
      where: {
        id: id,
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.card.deleteMany({
        where: {
          columnId: id,
        },
      });

      return await tx.column.delete({
        where: {
          id: id,
        },
      });
    });
  }
}
