import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class CacheStorage {
  abstract get: <T>(key: string) => Promise<T | undefined>;
  abstract set: <T>(key: string, value: T, ttl?: number) => Promise<boolean>;
  abstract del: (key: string) => Promise<boolean>;
  abstract clear: () => Promise<void>;
}
