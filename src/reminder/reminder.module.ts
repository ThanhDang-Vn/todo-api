import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReminderController],
  providers: [PrismaService, ReminderService],
})
export class ReminderModule {}
