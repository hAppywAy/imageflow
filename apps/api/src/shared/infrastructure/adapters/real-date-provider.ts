import { DateProvider } from '../../ports/date-provider';

export class RealDateProvider implements DateProvider {
  now() {
    return new Date();
  }
}
