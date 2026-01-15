import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { createColumnDto } from './dto/create-column.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('columns')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Get()
  getAllColumns() {
    return this.columnService.getAllColumn();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: createColumnDto) {
    return this.columnService.create(dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.columnService.delete(id);
  }
}
