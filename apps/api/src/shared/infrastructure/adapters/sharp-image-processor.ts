import sharp from 'sharp';
import { ImageMetadata, ImageProcessor } from '../../ports/image-processor';

export class SharpImageProcessor implements ImageProcessor {
  resizeImage(image: Buffer, width: number, height?: number): Promise<Buffer> {
    return sharp(image).resize(width, height).toBuffer();
  }

  toWebp(image: Buffer): Promise<Buffer> {
    return sharp(image).webp().toBuffer();
  }

  async getMetadata(image: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(image).metadata();

    return {
      width: metadata.width || 1,
      height: metadata.height || 1,
    };
  }
}
