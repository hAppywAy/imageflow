import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
  imports: [SharedModule],
  providers: [GalleryService],
  controllers: [GalleryController],
})
export class GalleryModule {}
