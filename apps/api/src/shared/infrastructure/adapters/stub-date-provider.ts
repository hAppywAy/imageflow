import { DateProvider } from '../../ports/date-provider';

export class StubDateProvider implements DateProvider {
  date = new Date('2021-01-01T00:00:00Z');
  now(): Date {
    return this.date;
  }
}
