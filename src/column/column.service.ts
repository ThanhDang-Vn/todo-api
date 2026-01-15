import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnService {
  constructor(private prisma: PrismaService) {}

  async getAllColumn() {
    return await this.prisma.column_task.findMany();
  }

  async create(dto: createColumnDto) {
    return await this.prisma.column_task.create({
      data: dto,
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
