import { computed, Injectable, signal } from '@angular/core';
import { User } from '../types/user';
import { Roles } from '../types/enums/roles';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _userDetails = signal<User | undefined>(undefined);
  public readonly userDetails = this._userDetails.asReadonly();

  public readonly isUserReadOnly = computed(() => {
    const user = this._userDetails();
    return user ? user.role === Roles.USER : false;
  });

  constructor() {
    this.loadUserDetails();
  }

  public loadUserDetails(): void {
    const userDetailsFromStorage = sessionStorage.getItem(environment.userDetailsSessionStorageKey);
    if (userDetailsFromStorage) {
      this._userDetails.set(JSON.parse(userDetailsFromStorage));
    }
  }

  public clearUserDetails(): void {
    this._userDetails.set(undefined);
  }
}
