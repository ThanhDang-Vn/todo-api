import { IsInt, IsString } from 'class-validator';

export class createPropertyDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  price: number;
}
