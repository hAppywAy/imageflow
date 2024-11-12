import { IsNumber } from 'class-validator';

export class GetGalleryDto {
  @IsNumber()
  page: number;
}
