import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../types/user';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _httpClient = inject(HttpClient);
  private readonly API_URL = environment.API_URL;

  private readonly _userDetails = signal<User | undefined>(undefined);
  public readonly userDetails = this._userDetails.asReadonly();

  constructor() {
    const userDetailsFromStorage = sessionStorage.getItem('userDetails');
    if (userDetailsFromStorage) {
      this._userDetails.set(JSON.parse(userDetailsFromStorage));
    }
  }

  /**
   * Creates a new user by sending a request to the backend
   * @param userData - The user data to create
   * @returns Observable<User> - The created user response
   */
  public createUser(userData: User): Observable<User> {
    const transformedData = this.transformUserDataForBackend(userData);

    return this._httpClient.post<User>(`${this.API_URL}/users`, transformedData).pipe(
      tap((createdUser) => {
        // Optionally store the created user details
        this._userDetails.set(createdUser);
        sessionStorage.setItem('userDetails', JSON.stringify(createdUser));
      }),
      catchError((error) => {
        throw error;
      })
    );
  }

  /**
   * Transforms user data to match backend UserDTO expectations
   */
  private transformUserDataForBackend(userData: User): any {
    return {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      // Don't include password - backend generates it and sends via email
      // role: 'USER', // Default role for new users
      isFirstLogin: true,
      userDetails: userData.userDetails
        ? {
            phoneNumber: this.cleanPhoneNumber(userData.userDetails.phoneNumber),
            address: userData.userDetails.address,
            postalCode: userData.userDetails.postalCode,
            birthDate: this.formatBirthDateForBackend(userData.userDetails.birthDate),
          }
        : null,
    };
  }

  /**
   * Cleans phone number to match backend regex: ^[+]?\d{7,15}$
   */
  private cleanPhoneNumber(phoneNumber: string | undefined): string | undefined {
    if (!phoneNumber) return undefined;

    // Remove spaces and keep only numbers and plus sign
    const cleaned = phoneNumber.replace(/\s/g, '');

    // Ensure it matches the backend pattern
    const phoneRegex = /^[+]?\d{7,15}$/;

    if (phoneRegex.test(cleaned)) {
      return cleaned;
    } else {
      return undefined;
    }
  }

  /**
   * Formats birth date for backend LocalDate (YYYY-MM-DD)
   */
  private formatBirthDateForBackend(birthDate: string | undefined): string | null {
    if (!birthDate) return null;

    try {
      const date = new Date(birthDate);

      if (isNaN(date.getTime())) {
        return null;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return null;
    }
  }

  /**
   * Updates the current user details in memory and storage
   */
  public updateUserDetails(user: User): void {
    this._userDetails.set(user);
    sessionStorage.setItem('userDetails', JSON.stringify(user));
  }

  /**
   * Clears user details from memory and storage
   */
  public clearUserDetails(): void {
    this._userDetails.set(undefined);
    sessionStorage.removeItem('userDetails');
  }
}
