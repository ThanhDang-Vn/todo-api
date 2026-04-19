import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
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
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notification/notification.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig, dbConfigProduction],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    RedisModule,
    UserModule,
    AuthModule,
    CardModule,
    ColumnModule,
    ReminderModule,
    CloudinaryModule,
    SearchModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
