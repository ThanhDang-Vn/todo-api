import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateReminderDto } from './dto/update-reminder';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('complete')
  @UseGuards(AuthGuard('jwt'))
  getAllCompletedCard(@Request() req) {
    return this.cardService.getCompleteCards(req.user.id);
  }

  @Get('inbox')
  @UseGuards(AuthGuard('jwt'))
  getAllInboxCard(@Request() req) {
    return this.cardService.getInboxCards(req.user.id);
  }

  @Get('today')
  @UseGuards(AuthGuard('jwt'))
  getAllTodayCard(@Request() req) {
    return this.cardService.getTodayCards(req.user.id);
  }

  @Get('upcoming')
  @UseGuards(AuthGuard('jwt'))
  getAllUpcommingCards(@Request() req) {
    return this.cardService.getUpcommingCards(req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() dto: CreateCardDto) {
    return this.cardService.create(dto, req.user.id);
  }

  @Put(':id/complete')
  @UseGuards(AuthGuard('jwt'))
  completeCard(@Param('id') id: string) {
    return this.cardService.complete(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Request() req, @Body() dto: UpdateCardDto, @Param('id') id) {
    return this.cardService.update(id, dto);
  }

  @Put(':id/reminder')
  @UseGuards(AuthGuard('jwt'))
  updateReminder(@Body() dto: UpdateReminderDto, @Param('id') id: string) {
    const remindAt = dto.remindAt;
    return this.cardService.updateReminder(remindAt, id);
  }

  @Delete('reminder/:id')
  @UseGuards(AuthGuard('jwt'))
  deleteReminder(@Param('id') id: string) {
    return this.cardService.deleteReminder(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Request() req, @Param('id') id: string) {
    return this.cardService.delete(id);
  }
}
