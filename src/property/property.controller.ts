import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { createPropertyDTO } from './dto/createProperty.dto';
import { updatePropertyDto } from './dto/updateProperty.dto';

@Controller('property')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  findAll() {
    return this.propertyService.findAllProperty();
  }

  @Get(':id')
  getProperty(@Param('id', ParseIntPipe) id) {
    return this.propertyService.findOneProperty(id);
  }

  @Post()
  createProperty(@Body() dto: createPropertyDTO) {
    return this.propertyService.createProperty(dto);
  }

  @Patch(':id')
  updateProperty(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: updatePropertyDto,
  ) {
    return this.propertyService.updateProperty(id, dto);
  }

  @Delete(':id')
  deleteProperty(@Param('id', ParseIntPipe) id: number) {
    return this.propertyService.deleteProperty(id);
  }
}
