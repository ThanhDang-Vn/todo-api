import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsString()
  priority?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsInt()
  columnId?: number;
}
