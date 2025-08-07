import { Injectable } from '@angular/core';
import { User } from '../types/user';

const initialUser: User = {
  id: undefined,
  email: undefined,
  firstName: undefined,
  lastName: undefined,
  role: undefined,
  userDetails: {
    id: undefined,
    address: undefined,
    phoneNumber: undefined,
    postalCode: undefined,
    birthDate: undefined,
  },
  isFirstLogin: undefined,
};

@Injectable({
  providedIn: 'root',
})
export class UserDetailsService {
  private userInformation = initialUser;

  public setUserDetails(user: User): void {
    this.userInformation = {
      ...this.userInformation,
      ...user,
      userDetails: {
        ...this.userInformation.userDetails,
        ...user.userDetails,
      },
    };
  }

  public getUserDetails(): User {
    return this.userInformation;
  }

  public clearUserDetails(): void {
    this.userInformation = initialUser;
  }

  public getEmail(): string | undefined {
    return this.userInformation.email;
  }
}
