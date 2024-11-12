import { IsNumber } from 'class-validator';

export class GetCommentsDto {
  @IsNumber()
  page: number;
}
