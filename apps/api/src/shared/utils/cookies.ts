import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
import { SESSION_TTL_MS } from 'src/auth/config/storage';

export const getCookiesOptions = (
  configService: ConfigService,
): CookieOptions => ({
  httpOnly: true,
  secure: configService.get('HTTPS') === 'true',
  sameSite: configService.get('HTTPS') === 'true' ? 'none' : 'lax',
  maxAge: SESSION_TTL_MS,
});
