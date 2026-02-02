import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() dto: CreateCardDto) {
    return this.cardService.create(dto);
  }

  @Put(':id/complete')
  @UseGuards(AuthGuard('jwt'))
  completeCard(@Param('id', ParseIntPipe) id: number) {
    return this.cardService.complete(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Request() req,
    @Body() dto: UpdateCardDto,
    @Param('id', ParseIntPipe) id,
  ) {
    return this.cardService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Request() req, @Param('id', ParseIntPipe) id) {
    return this.cardService.delete(id);
  }
}
