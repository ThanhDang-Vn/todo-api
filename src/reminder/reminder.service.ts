import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Injectable()
export class ReminderService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReminderDto) {
    return await this.prisma.reminder.create({
      data: {
        remindAt: dto.remindAt,
        cardId: dto.cardId,
      },
    });
  }
}
