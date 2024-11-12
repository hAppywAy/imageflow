import 'express';
import { Multer as MulterNamed } from 'multer';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Multer extends MulterNamed {}
  }
}

declare module 'express' {
  interface Request {
    session?: {
      id: string;
      user: {
        id: string;
        username: string;
      };
    };
  }
}
