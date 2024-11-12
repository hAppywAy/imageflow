import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma.service';
import { UploadImageDto } from './dtos/upload-image.dto';
import { MinioService } from 'src/shared/infrastructure/minio.service';
import { GetGalleryDto } from './dtos/get-gallery.dto';
import path from 'path';
import { slugify } from 'src/shared/utils/string';
import { GetCommentsDto } from './dtos/get-comments.dto';
import {
  COMMENTS_LIMIT,
  BUCKET_NAME,
  IMAGES_LIMIT,
  ORIGINALS_FOLDER,
  THUMBNAILS_FOLDER,
  BUCKET_POLICY,
} from './gallery.config';
import { ImageProcessor } from 'src/shared/ports/image-processor';
import { DateProvider } from 'src/shared/ports/date-provider';

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly imageProcessor: ImageProcessor,
    private readonly dateProvider: DateProvider,
  ) {}

  async toggleLike(imageId: string, userId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const like = await this.prisma.like.findFirst({
      where: { imageId, userId },
    });

    if (like) {
      await this.prisma.like.delete({
        where: { id: like.id },
      });
      return;
    }

    await this.prisma.like.create({
      data: {
        user: { connect: { id: userId } },
        image: { connect: { id: imageId } },
      },
    });
  }

  async comment(imageId: string, userId: string, content: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.prisma.comment.create({
      data: {
        content,
        user: { connect: { id: userId } },
        image: { connect: { id: imageId } },
      },
    });
  }

  async getComments(params: GetCommentsDto, imageId: string) {
    const { page } = params;
    const offset = (page - 1) * COMMENTS_LIMIT;
    const comments = await this.prisma.comment.findMany({
      skip: offset,
      take: COMMENTS_LIMIT,
      where: { imageId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return {
      total: await this.prisma.comment.count({ where: { imageId } }),
      limit: COMMENTS_LIMIT,
      page: page,
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.userId,
          username: comment.user.username,
        },
        createdAt: comment.createdAt,
      })),
    };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.userId !== userId) {
      throw new UnauthorizedException('You are not the owner of this comment');
    }
    await this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async deleteImage(imageId: string, userId: string) {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    if (image.userId !== userId) {
      throw new UnauthorizedException('You are not the owner of this image');
    }

    await Promise.all([
      this.prisma.image.delete({
        where: { id: imageId },
      }),
      this.minio.removeObject(BUCKET_NAME, image.path),
      this.minio.removeObject(BUCKET_NAME, image.thumbnailPath),
    ]);
  }

  async getGallery(params: GetGalleryDto, userId?: string) {
    const { page } = params;
    const offset = (page - 1) * IMAGES_LIMIT;
    const images = await this.prisma.image.findMany({
      skip: offset,
      take: IMAGES_LIMIT,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
        likes: {
          where: { userId: userId },
          select: {
            userId: true,
          },
        },
      },
    });

    return {
      total: await this.prisma.image.count(),
      limit: IMAGES_LIMIT,
      page: page,
      images: images.map((image) => ({
        id: image.id,
        caption: image.caption,
        url: this.getImageUrl(image.path),
        thumbnailUrl: this.getImageUrl(image.thumbnailPath),
        ratio: image.width / image.height,
        isLiked: !!image.likes.length,
        likes: image._count.likes,
        comments: image._count.comments,
        owner: {
          id: image.userId,
          username: image.user.username,
        },
        createdAt: image.createdAt,
      })),
    };
  }

  async uploadImage(
    file: Express.Multer.File,
    data: UploadImageDto & { userId: string },
  ) {
    const bucketExists = await this.minio.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await this.minio.makeBucket(BUCKET_NAME);

      await this.minio.setBucketPolicy(
        BUCKET_NAME,
        JSON.stringify(BUCKET_POLICY),
      );
    }

    const fileName = this.generateFilename(file.originalname);
    const originalPath = path.join(data.userId, ORIGINALS_FOLDER, fileName);
    const thumbnailPath = path.join(data.userId, THUMBNAILS_FOLDER, fileName);

    await Promise.all([
      this.saveOriginalToBucket(file, originalPath),
      this.saveThumbnailToBucket(file, thumbnailPath),
    ]);

    const metadata = await this.imageProcessor.getMetadata(file.buffer);

    await this.prisma.image.create({
      data: {
        name: fileName,
        path: originalPath,
        thumbnailPath: thumbnailPath,
        width: metadata.width || 1,
        height: metadata.height || 1,
        caption: data.caption,
        user: {
          connect: { id: data.userId },
        },
      },
    });
  }

  private async saveOriginalToBucket(file: Express.Multer.File, path: string) {
    await this.minio.putObject(BUCKET_NAME, path, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
  }

  private async saveThumbnailToBucket(file: Express.Multer.File, path: string) {
    const resized = await this.imageProcessor.resizeImage(file.buffer, 450);
    const webp = await this.imageProcessor.toWebp(resized);

    await this.minio.putObject(BUCKET_NAME, path, webp, webp.byteLength, {
      'Content-Type': 'image/webp',
    });
  }

  private generateFilename(originalname: string) {
    const ext = path.extname(originalname);
    const fileNameWithoutExt = originalname.replace(ext, '');
    return `${this.dateProvider.now().getTime()}-${slugify(fileNameWithoutExt)}${ext}`;
  }

  private getImageUrl(imagePath: string) {
    const fullPath = path.join(BUCKET_NAME, imagePath);
    return new URL(fullPath, this.minio.publicUrl).toString();
  }
}
