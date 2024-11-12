import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { routesV1 } from 'src/config/app.routes';
import { GalleryService } from './gallery.service';
import { UploadImageDto } from './dtos/upload-image.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetGalleryDto } from './dtos/get-gallery.dto';
import { CommentDto } from './dtos/comment.dto';
import { GetCommentsDto } from './dtos/get-comments.dto';

@Controller(routesV1.version)
@UseGuards(AuthGuard)
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post(routesV1.gallery.toggleLike)
  async toggleLike(@Param('imageId') imageId: string, @Req() req: Request) {
    const session = req.session;

    if (!session) {
      throw new BadRequestException('No session found');
    }

    await this.galleryService.toggleLike(imageId, session.user.id);
  }

  @Post(routesV1.gallery.comment)
  async comment(
    @Param('imageId') imageId: string,
    @Body() body: CommentDto,
    @Req() req: Request,
  ) {
    const session = req.session;
    if (!session) {
      throw new BadRequestException('No session found');
    }
    await this.galleryService.comment(imageId, session.user.id, body.content);
  }

  @Get(routesV1.gallery.getComments)
  async getComments(
    @Query() query: GetCommentsDto,
    @Param('imageId') imageId: string,
  ) {
    const res = await this.galleryService.getComments(query, imageId);

    return {
      total: res.total,
      limit: res.limit,
      page: res.page,
      data: res.comments,
    };
  }

  @Delete(routesV1.gallery.deleteComment)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ) {
    const session = req.session;
    if (!session) {
      throw new BadRequestException('No session found');
    }
    await this.galleryService.deleteComment(commentId, session.user.id);
  }

  @Delete(routesV1.gallery.deleteImage)
  async deleteImage(@Param('imageId') imageId: string, @Req() req: Request) {
    const session = req.session;
    if (!session) {
      throw new BadRequestException('No session found');
    }
    await this.galleryService.deleteImage(imageId, session.user.id);
  }

  @Post(routesV1.gallery.uploadImage)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
    }),
  )
  async uploadImage(
    @Body() uploadImageDto: UploadImageDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const session = req.session;

    if (!session) {
      throw new BadRequestException('No session found');
    }

    if (!file) {
      throw new BadRequestException('No file found');
    }

    const res = await this.galleryService.uploadImage(file, {
      ...uploadImageDto,
      userId: session.user.id,
    });

    return res;
  }

  @Get(routesV1.gallery.root)
  async getGallery(@Query() query: GetGalleryDto) {
    const res = await this.galleryService.getGallery(query);

    return {
      total: res.total,
      limit: res.limit,
      page: res.page,
      data: res.images,
    };
  }
}
