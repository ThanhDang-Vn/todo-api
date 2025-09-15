import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipes implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    const parseValue = this.schema.safeParse(value);

    if (parseValue.success) return parseValue;

    throw new BadRequestException(parseValue.error.format());
  }
}
