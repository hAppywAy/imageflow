import { Test, TestingModule } from '@nestjs/testing';
import { GalleryService } from './gallery.service';
import { PrismaService } from 'src/shared/infrastructure/prisma.service';
import { MinioService } from 'src/shared/infrastructure/minio.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  BUCKET_NAME,
  IMAGES_LIMIT,
  ORIGINALS_FOLDER,
  THUMBNAILS_FOLDER,
} from './gallery.config';
import { DateProvider } from 'src/shared/ports/date-provider';
import { ImageProcessor } from 'src/shared/ports/image-processor';
import { StubDateProvider } from 'src/shared/infrastructure/adapters/stub-date-provider';
import { StubImageProcessor } from 'src/shared/infrastructure/adapters/stub-image-processor';

const mockPrismaService = {
  image: {
    findUnique: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  like: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const mockMinioService = {
  publicUrl: 'https://minio.mocked.url',
  removeObject: jest.fn(),
  makeBucket: jest.fn(),
  bucketExists: jest.fn(),
  setBucketPolicy: jest.fn(),
  putObject: jest.fn(),
};

describe('GalleryService', () => {
  let service: GalleryService;
  let prisma: typeof mockPrismaService;
  let minio: typeof mockMinioService;
  let dateProvider: StubDateProvider;
  let imageProcessor: StubImageProcessor;

  beforeEach(async () => {
    dateProvider = new StubDateProvider();
    imageProcessor = new StubImageProcessor();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GalleryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MinioService, useValue: mockMinioService },
        { provide: DateProvider, useValue: dateProvider },
        { provide: ImageProcessor, useValue: imageProcessor },
      ],
    }).compile();

    service = module.get<GalleryService>(GalleryService);
    prisma = module.get(PrismaService);
    minio = module.get(MinioService);
  });

  describe('toggleLike()', () => {
    it('should add a like if not already liked', async () => {
      prisma.image.findUnique.mockResolvedValue({ id: 'imageId' });
      prisma.like.findFirst.mockResolvedValue(null);
      prisma.like.create.mockResolvedValue({ id: 'likeId' });

      await service.toggleLike('imageId', 'userId');

      expect(prisma.like.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 'userId' } },
          image: { connect: { id: 'imageId' } },
        },
      });
    });

    it('should remove a like if already liked', async () => {
      prisma.image.findUnique.mockResolvedValue({ id: 'imageId' });
      prisma.like.findFirst.mockResolvedValue({ id: 'likeId' });
      await service.toggleLike('imageId', 'userId');
      expect(prisma.like.delete).toHaveBeenCalledWith({
        where: { id: 'likeId' },
      });
    });

    it('should throw NotFoundException if image does not exist', async () => {
      prisma.image.findUnique.mockResolvedValue(null);

      await expect(service.toggleLike('imageId', 'userId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('comment()', () => {
    it('should add a comment', async () => {
      prisma.image.findUnique.mockResolvedValue({ id: 'imageId' });
      await service.comment('imageId', 'userId', 'content');
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'content',
          user: { connect: { id: 'userId' } },
          image: { connect: { id: 'imageId' } },
        },
      });
    });

    it('should throw NotFoundException if image does not exist', async () => {
      prisma.image.findUnique.mockResolvedValue(null);
      await expect(
        service.comment('imageId', 'userId', 'content'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getComments()', () => {
    it('should return comments', async () => {
      const imageId = 'imageId';
      const page = 1;
      const comments = [
        {
          id: 'commentId',
          content: 'content',
          userId: 'userId',
          user: {
            username: 'username',
          },
          createdAt: new Date('2021-01-01'),
        },
      ];
      prisma.comment.count.mockResolvedValue(1);
      prisma.comment.findMany.mockResolvedValue(comments);
      const result = await service.getComments({ page }, imageId);
      expect(result).toEqual({
        total: 1,
        limit: 10,
        page: 1,
        comments: [
          {
            id: 'commentId',
            content: 'content',
            author: {
              id: 'userId',
              username: 'username',
            },
            createdAt: new Date('2021-01-01'),
          },
        ],
      });
    });
  });

  describe('deleteComment()', () => {
    it('should delete a comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'commentId',
        userId: 'userId',
      });
      await service.deleteComment('commentId', 'userId');
      expect(prisma.comment.findUnique).toHaveBeenCalledWith({
        where: { id: 'commentId' },
      });
      expect(prisma.comment.delete).toHaveBeenCalledWith({
        where: { id: 'commentId' },
      });
    });

    it('should throw UnauthorizedException if user is not the owner of the comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({
        id: 'commentId',
        userId: 'anotherUserId',
      });
      await expect(
        service.deleteComment('commentId', 'userId'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if comment does not exist', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);
      await expect(
        service.deleteComment('commentId', 'userId'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteImage()', () => {
    it('should delete an image', async () => {
      prisma.image.findUnique.mockResolvedValue({
        id: 'imageId',
        userId: 'userId',
        path: 'image.jpg',
        thumbnailPath: 'thumbnail.jpg',
      });
      await service.deleteImage('imageId', 'userId');
      expect(prisma.image.delete).toHaveBeenCalledWith({
        where: { id: 'imageId' },
      });
    });

    it('should remove bucket objects', async () => {
      prisma.image.findUnique.mockResolvedValue({
        id: 'imageId',
        userId: 'userId',
        path: 'image.jpg',
        thumbnailPath: 'thumbnail.jpg',
      });
      await service.deleteImage('imageId', 'userId');

      expect(minio.removeObject).toHaveBeenCalledWith(BUCKET_NAME, 'image.jpg');
      expect(minio.removeObject).toHaveBeenCalledWith(
        BUCKET_NAME,
        'thumbnail.jpg',
      );
    });

    it('should throw UnauthorizedException if user is not the owner of the image', async () => {
      prisma.image.findUnique.mockResolvedValue({
        id: 'imageId',
        userId: 'anotherUserId',
      });
      await expect(service.deleteImage('imageId', 'userId')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw NotFoundException if image does not exist', async () => {
      prisma.image.findUnique.mockResolvedValue(null);
      await expect(service.deleteImage('imageId', 'userId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getGallery()', () => {
    it('should return gallery', async () => {
      prisma.image.findMany.mockResolvedValue([
        {
          id: 'id-1',
          caption: 'My image',
          path: 'image.jpg',
          thumbnailPath: 'thumbnail/image.jpg',
          width: 1920,
          height: 1920,
          userId: 'userId',
          user: {
            username: 'Bobby',
          },
          likes: [],
          createdAt: new Date('2021-01-01'),
          _count: {
            likes: 0,
            comments: 0,
          },
        },
        {
          id: 'id-2',
          caption: 'Picture of a cat',
          path: 'cat.jpg',
          thumbnailPath: 'thumbnail/cat.jpg',
          width: 1920,
          height: 1080,
          userId: 'userId',
          user: {
            username: 'Bobby',
          },
          likes: [{ userId: 'userId' }],
          createdAt: new Date('2021-01-01'),
          _count: {
            likes: 1,
            comments: 2,
          },
        },
      ]);
      prisma.image.count.mockResolvedValue(2);

      const result = await service.getGallery({ page: 1 });

      expect(result).toEqual({
        total: 2,
        limit: IMAGES_LIMIT,
        page: 1,
        images: [
          {
            id: 'id-1',
            caption: 'My image',
            url: `https://minio.mocked.url/${BUCKET_NAME}/image.jpg`,
            thumbnailUrl: `https://minio.mocked.url/${BUCKET_NAME}/thumbnail/image.jpg`,
            ratio: 1,
            isLiked: false,
            likes: 0,
            comments: 0,
            owner: {
              id: 'userId',
              username: 'Bobby',
            },
            createdAt: new Date('2021-01-01'),
          },
          {
            id: 'id-2',
            caption: 'Picture of a cat',
            url: `https://minio.mocked.url/${BUCKET_NAME}/cat.jpg`,
            thumbnailUrl: `https://minio.mocked.url/${BUCKET_NAME}/thumbnail/cat.jpg`,
            ratio: 1920 / 1080,
            isLiked: true,
            likes: 1,
            comments: 2,
            owner: {
              id: 'userId',
              username: 'Bobby',
            },
            createdAt: new Date('2021-01-01'),
          },
        ],
      });
    });
  });

  describe('uploadImage()', () => {
    it('should upload an image', async () => {
      const now = new Date('2021-01-01');
      dateProvider.date = now;
      imageProcessor.width = 1920;
      imageProcessor.height = 1080;
      minio.bucketExists.mockResolvedValue(true);

      const file = {
        originalname: 'image.jpg',
        mimetype: 'image/jpeg',
        path: '/tmp/image.jpg',
        buffer: Buffer.from('image'),
        size: 1024,
      } as any;

      await service.uploadImage(file, {
        caption: 'My image',
        userId: 'userId',
      });

      const expectedImageName = `${now.getTime()}-image.jpg`;
      expect(prisma.image.create).toHaveBeenCalledWith({
        data: {
          caption: 'My image',
          name: expectedImageName,
          path: `userId/${ORIGINALS_FOLDER}/${expectedImageName}`,
          thumbnailPath: `userId/${THUMBNAILS_FOLDER}/${expectedImageName}`,
          width: 1920,
          height: 1080,
          user: { connect: { id: 'userId' } },
        },
      });
    });

    it('should create a bucket if it does not exist', async () => {
      const now = new Date('2021-01-01');
      dateProvider.date = now;
      imageProcessor.width = 1920;
      imageProcessor.height = 1080;
      minio.bucketExists.mockResolvedValue(false);

      const file = {
        originalname: 'image.jpg',
        mimetype: 'image/jpeg',
        path: '/tmp/image.jpg',
        buffer: Buffer.from('image'),
        size: 1024,
      } as any;

      await service.uploadImage(file, {
        caption: 'My image',
        userId: 'userId',
      });

      expect(minio.makeBucket).toHaveBeenCalledWith(BUCKET_NAME);
    });
  });
});
