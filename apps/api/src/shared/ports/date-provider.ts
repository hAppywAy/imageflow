import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class DateProvider {
  now: () => Date;
}
