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
import { ColumnService } from './column.service';
import { createColumnDto } from './dto/create-column.dto';
import { AuthGuard } from '@nestjs/passport';
import { updateColumnDto } from './dto/update-column.dto';

@Controller('columns')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Get()
  getAllVocabulary(@Request() req) {
  return [
    {
      id: 1,
      word: 'Apple',
      pronunciation: "/'æpəl/",
      meaning: 'Quả táo',
      isFavorite: true,
    },
    {
      id: 2,
      word: 'Banana',
      pronunciation: "/bə'nɑ:nə/",
      meaning: 'Quả chuối',
      isFavorite: false,
    },
    {
      id: 3,
      word: 'Coffee',
      pronunciation: "/'kɒfi/",
      meaning: 'Cà phê',
      isFavorite: true,
    },
  ];
}

  @Post()
  create(@Body() dto: createColumnDto, @Request() req) {
    return this.columnService.create(dto, req.user.id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.columnService.duplicate(id);
  }

  @Put(':id')
  update(@Body() dto: updateColumnDto, @Param('id') id: string) {
    return this.columnService.update(dto, id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.columnService.delete(id);
  }
}
