import { ImageProcessor } from '../../ports/image-processor';

/* eslint-disable @typescript-eslint/no-unused-vars */
export class StubImageProcessor implements ImageProcessor {
  width = 0;
  height = 0;
  async resizeImage(
    image: Buffer,
    _width: number,
    _height: number,
  ): Promise<Buffer> {
    return image;
  }
  async toWebp(image: Buffer): Promise<Buffer> {
    return image;
  }
  async getMetadata(image: Buffer): Promise<{ width: number; height: number }> {
    return { width: this.width, height: this.height };
  }
}
