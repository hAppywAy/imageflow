import KeyvRedis from '@keyv/redis';
import { Logger } from '@nestjs/common';
import Keyv from 'keyv';
import { CacheStorage } from 'src/shared/ports/cache-storage';

export class RedisCacheStorage implements CacheStorage {
  private logger = new Logger(RedisCacheStorage.name);
  private keyv: Keyv;
  constructor(redisUrl: string, namespace?: string) {
    this.keyv = new Keyv(new KeyvRedis(redisUrl), {
      ttl: 60 * 60 * 24, // 24 hours
      namespace: namespace ?? 'cache',
    });

    this.keyv.on('error', (err) => this.logger.error('Connection Error', err));
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.keyv.get(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.keyv.set(key, value, ttl);
  }

  async del(key: string): Promise<boolean> {
    return this.keyv.delete(key);
  }

  async clear(): Promise<void> {
    return this.keyv.clear();
  }
}
