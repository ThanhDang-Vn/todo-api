import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';

@Module({
  imports: [PrismaModule],
  controllers: [ColumnController],
  providers: [PrismaService, ColumnService],
})
export class ColumnModule {}
