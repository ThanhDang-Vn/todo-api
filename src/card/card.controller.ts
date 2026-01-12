import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('cards')
@UseGuards(AuthGuard('jwt'))
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateCardDto) {
    return this.cardService.create(req.user.id, dto);
  }
}
