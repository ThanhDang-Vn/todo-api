import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { createColumnDto } from './dto/create-column.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('columns')
@UseGuards(AuthGuard('jwt'))
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Get()
  getAllColumns(@Request() req) {
    return this.columnService.getAllColumn(req.user.id);
  }

  @Post()
  create(@Body() dto: createColumnDto, @Request() req) {
    return this.columnService.create(dto, req.user.id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.columnService.duplicate(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.columnService.delete(id);
  }
}
