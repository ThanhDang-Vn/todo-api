import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async getAllColumn(userId: number) {
    return await this.prisma.column_task.findMany({
      where: {
        userUserId: userId,
      },
      include: {
        card: true,
      },
    });
  }

  async create(dto: createColumnDto, userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.column_task.create({
      data: {
        title: dto.title,
        userUserId: userId,
      },
    });
  }

  async delete(id: number) {
    const column = await this.prisma.column_task.findUnique({
      where: {
        columnId: id,
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }
    return await this.prisma.column_task.delete({
      where: {
        columnId: id,
      },
    });
  }
}
