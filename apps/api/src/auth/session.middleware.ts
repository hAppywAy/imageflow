import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SESSION_TTL_MS, getSessionStorageKey } from './config/storage';
import { ConfigService } from '@nestjs/config';
import { getCookiesOptions } from 'src/shared/utils/cookies';
import { CacheStorage } from 'src/shared/ports/cache-storage';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    private readonly cache: CacheStorage,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const sessionId = req.cookies['sessionId'];

    if (!sessionId) {
      next();
      return;
    }

    const user: { id: string; username: string } = await this.cache.get(
      getSessionStorageKey(sessionId),
    );

    if (!user) {
      next();
      return;
    }

    req.session = { id: sessionId, user };

    res.on('finish', async () => {
      await this.cache.set(sessionId, req.session, SESSION_TTL_MS);
    });

    res.cookie('sessionId', sessionId, getCookiesOptions(this.configService));

    next();
  }
}
