import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Controller('reminder')
@UseGuards(AuthGuard('jwt'))
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  create(@Body() dto: CreateReminderDto) {
    return this.reminderService.create(dto);
  }
}
