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
      },
    });
  }

  async update(cardId: number, dto: UpdateCardDto) {
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
        order: dto.columnId ? order : card.order,
      },
      include: {
        column: true,
      },
    });
  }

  async delete(cardId: number) {
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
