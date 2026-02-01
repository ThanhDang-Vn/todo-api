import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createColumnDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  order?: number;
}
