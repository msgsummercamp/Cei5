import { Injectable, signal } from '@angular/core';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _userDetails = signal<User | undefined>(undefined);
  public readonly userDetails = this._userDetails.asReadonly();

  constructor() {
    const userDetailsFromStorage = sessionStorage.getItem('userDetails');
    if (userDetailsFromStorage) {
      this._userDetails.set(JSON.parse(userDetailsFromStorage));
    }
  }
}
