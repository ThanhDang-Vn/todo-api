import { PartialType } from '@nestjs/mapped-types';
import { createPropertyDTO } from './createProperty.dto';

export class updatePropertyDto extends PartialType(createPropertyDTO) {}
