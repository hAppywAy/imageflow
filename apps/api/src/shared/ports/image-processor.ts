import { Injectable } from '@nestjs/common';

export interface ImageMetadata {
  width: number;
  height: number;
}

@Injectable()
export abstract class ImageProcessor {
  resizeImage: (
    image: Buffer,
    width: number,
    height?: number,
  ) => Promise<Buffer>;
  toWebp: (image: Buffer) => Promise<Buffer>;
  getMetadata: (image: Buffer) => Promise<ImageMetadata>;
}
