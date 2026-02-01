import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async getAllColumn(userId: number) {
    return await this.prisma.column.findMany({
      where: {
        userId: userId,
      },
      include: {
        cards: true,
      },
    });
  }

  async create(dto: createColumnDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.column.create({
      data: {
        title: dto.title,
        userId: userId,
      },
    });
  }

  async delete(id: number) {
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
