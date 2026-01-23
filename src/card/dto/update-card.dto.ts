import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priority?: 'low' | 'medium' | 'high';

  @IsNotEmpty()
  @IsInt()
  columnId: number;
}
