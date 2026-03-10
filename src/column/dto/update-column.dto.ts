import { IsOptional, IsString } from 'class-validator';

export class updateColumnDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  order?: number;
}
