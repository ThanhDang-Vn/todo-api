import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async create( dto: CreateCardDto) {
    const column = await this.prisma.column_task.findUnique({
      where: { columnId: dto.columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found or access denied');
    }

    return await this.prisma.card.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        priority: dto.priority || 'medium',
        due_to: dto.dateDue || new Date(),
        columnColumnId: dto.columnId,
      },
    });
  }
}
