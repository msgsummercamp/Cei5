import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../types/user';
import { environment } from '../../../environments/environment';
import { NotificationService } from './toaster/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translateService = inject(TranslateService);
  private readonly API_URL = environment.API_URL;

  private readonly _userDetails = signal<User | undefined>(undefined);
  public readonly userDetails = this._userDetails.asReadonly();

  public readonly isUserReadOnly = computed(() => {
    const user = this._userDetails();
    return !!user;
  });

  constructor() {
    this.loadUserDetails();
  }

  public loadUserDetails(): void {
    const userDetailsFromStorage = localStorage.getItem(environment.userDetailsLocalStorageKey);
    if (userDetailsFromStorage) {
      this._userDetails.set(JSON.parse(userDetailsFromStorage));
    }
  }

  public clearUserDetails(): void {
    this._userDetails.set(undefined);
  }

  /**
   * Creates a new user by sending a request to the backend
   * @param userData - The user data to create
   * @returns Observable<User> - The created user response
   */
  public createUser(userData: User): Observable<User> {
    const transformedData = this.transformUserDataForBackend(userData);

    return this._httpClient.post<User>(`${this.API_URL}/auth/register`, transformedData).pipe(
      catchError((error) => {
        throw error;
      }),
      tap(() => {
        this._notificationService.showSuccess(
          this._translateService.instant('user-service.user-created')
        );
      })
    );
  }

  /**
   * Creates a new user by sending a request to the backend
   * @returns Observable<User> - All Users
   */
  public getAllUsers(): Observable<User[]> {
    return this._httpClient.get<User[]>(`${this.API_URL}/users`).pipe(
      catchError((error) => {
        throw error;
      })
    );
  }

  /**
   * Fetches all employees from the backend
   * @returns Observable<User[]> - All Employees
   */
  public getAllEmployees(): Observable<User[]> {
    return this._httpClient.get<User[]>(`${this.API_URL}/users/employees`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          this._notificationService.showError(
            this._translateService.instant('api-errors.network-error')
          );
        } else {
          const apiError = error?.error;
          if (apiError) {
            this._notificationService.showError(this._translateService.instant(apiError.detail));
          }
        }
        return of([]);
      })
    );
  }

  /**
   * Creates a new user by sending a request to the backend
   * @returns Observable<void> - deletes a User
   */
  public deleteUser(userId: string): Observable<void> {
    return this._httpClient.delete<void>(`${this.API_URL}/users/${userId}`).pipe(
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
      role: userData.role,
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
}
