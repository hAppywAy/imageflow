import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService extends Minio.Client {
  public publicUrl: string;
  constructor(configService: ConfigService) {
    const secretKey = configService.get('MINIO_SECRET_KEY');
    const accessKey = configService.get('MINIO_ACCESS_KEY');
    const endPoint = configService.get('MINIO_ENDPOINT');
    const publicUrl = configService.get('MINIO_PUBLIC_URL');
    const port = Number(configService.get('MINIO_PORT'));
    const ssl = configService.get('MINIO_SSL') === 'true';

    if (!secretKey) {
      throw new Error('MINIO_SECRET_KEY is not set');
    }

    if (!accessKey) {
      throw new Error('MINIO_ACCESS_KEY is not set');
    }

    if (!endPoint) {
      throw new Error('MINIO_ENDPOINT is not set');
    }

    if (!publicUrl) {
      throw new Error('MINIO_PUBLIC_URL is not set');
    }

    if (isNaN(port)) {
      throw new Error('MINIO_PORT is not set');
    }

    super({
      endPoint,
      port: isNaN(port) ? undefined : port,
      useSSL: ssl,
      accessKey,
      secretKey,
    });

    this.publicUrl = publicUrl;
  }
}
