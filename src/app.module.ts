import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import dbConfig from './config/db.config';
import dbConfigProduction from './config/db.config.production';
import { CardModule } from './card/card.module';
import { ColumnModule } from './column/column.module';

import { ReminderModule } from './reminder/reminder.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig, dbConfigProduction],
    }),
    UserModule,
    AuthModule,
    CardModule,
    ColumnModule,
    ReminderModule,
  
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
