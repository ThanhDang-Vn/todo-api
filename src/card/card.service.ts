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

    return await this.prisma.card.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        priority: dto.priority || 'medium',
        dueTo: dto.dateDue || new Date(),
        columnId: dto.columnId,
      },
    });
  }

  async update(cardId: number, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({
      where: {
        id: cardId,
      },
    });

    console.log(dto);

    if (!card) {
      throw new NotFoundException('Card not found or access denied');
    }

    return await this.prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        ...dto,
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
