import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateReminderDto {
  @IsString()
  @IsNotEmpty()
  remindAt: string;
}
