import { Reminder } from '@prisma/client';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsString()
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsDate()
  dateDue?: Date;

  @IsNotEmpty()
  @IsString()
  columnId: string;

  @IsOptional()
  reminders?: Reminder[];
}
