import { Session } from './types/session';
import { makeAutoObservable } from 'mobx';

export class AuthStore {
  session: Session | null = null;

  constructor() {
    makeAutoObservable(this);
  }
}
