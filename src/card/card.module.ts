import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './services/card.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardScheduleService } from './services/card-schedule.service';

@Module({
  imports: [PrismaModule],
  controllers: [CardController],
  providers: [CardService, PrismaService, CardScheduleService],
})
export class CardModule {}
