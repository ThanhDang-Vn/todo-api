import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from 'src/entities/property.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  controllers: [PropertyController],
  providers: [PropertyService],
})

export class PropertyModule {}
