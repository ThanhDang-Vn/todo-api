import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/entities/property.entity';
import { createPropertyDTO } from './dto/createProperty.dto';
import { Repository } from 'typeorm';
import { updatePropertyDto } from './dto/updateProperty.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property) private propertyRepo: Repository<Property>,
  ) {}

  findAllProperty() {
    return this.propertyRepo.find();
  }

  async findOneProperty(id: number) {
    const property = await this.propertyRepo.findOne({
      where: {
        id,
      },
    });

    if (!property) throw new NotFoundException();

    return property;
  }

  async createProperty(dto: createPropertyDTO) {
    return await this.propertyRepo.save(dto);
  }

  async updateProperty(id: number, dto: updatePropertyDto) {
    await this.propertyRepo.update({ id }, dto);
  }

  async deleteProperty(id: number) {
    await this.propertyRepo.delete({id})
  }
}
