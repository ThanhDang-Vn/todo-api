import { IsNotEmpty, IsString } from 'class-validator';

export class createColumnDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
