import { IsNotEmpty, IsString } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'keyword can not be empty' })
  q: string;
}
