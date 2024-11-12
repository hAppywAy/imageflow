import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/prisma.service';
import { MinioService } from './infrastructure/minio.service';
import { DateProvider } from './ports/date-provider';
import { RealDateProvider } from './infrastructure/adapters/real-date-provider';
import { ImageProcessor } from './ports/image-processor';
import { SharpImageProcessor } from './infrastructure/adapters/sharp-image-processor';
import { CacheStorage } from './ports/cache-storage';
import { ConfigService } from '@nestjs/config';
import { RedisCacheStorage } from './infrastructure/adapters/redis-cache-storage';

@Module({
  imports: [],
  providers: [
    PrismaService,
    MinioService,
    {
      provide: CacheStorage,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          throw new Error('REDIS_URL is not set');
        }
        return new RedisCacheStorage(redisUrl);
      },
      inject: [ConfigService],
    },
    {
      provide: DateProvider,
      useClass: RealDateProvider,
    },
    {
      provide: ImageProcessor,
      useClass: SharpImageProcessor,
    },
  ],
  exports: [
    PrismaService,
    MinioService,
    CacheStorage,
    DateProvider,
    ImageProcessor,
  ],
})
export class SharedModule {}
