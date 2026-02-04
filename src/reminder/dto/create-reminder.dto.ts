import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  @IsNotEmpty()
  remindAt: string;

  @IsNotEmpty()
  cardId: number;
}
