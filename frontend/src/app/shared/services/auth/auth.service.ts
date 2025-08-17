import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AuthState } from '../../types/auth/auth-state';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DecodedToken } from '../../types/auth/decoded-token';
import { jwtDecode } from 'jwt-decode';
import { SignInRequest } from '../../types/auth/sign-in-request';
import { SignInResponse } from '../../types/auth/sign-in-response';
import { User } from '../../types/user';
import { NotificationService } from '../toaster/notification.service';
import {
  InitiatePasswordResetRequest,
  PasswordResetRequest,
} from '../../types/auth/password-reset';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../user.service';
import { ApiError } from '../../types/api-error';
import { TokenResponse } from '../../types/auth/token-response';

const defaultUser: User = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  role: undefined,
  userDetails: {
    id: '',
    address: '',
    phoneNumber: '',
    postalCode: '',
    birthDate: '',
  },
  isFirstLogin: false,
};

const initialState: AuthState = {
  isAuthenticated: false,
  id: '',
  email: '',
  role: '',
  user: defaultUser,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _translationService = inject(TranslateService);
  private readonly _userService = inject(UserService);
  private readonly API_URL: string = environment.API_URL;

  private readonly _authState = signal<AuthState>(initialState);
  public isLoggedIn = computed(() => this._authState().isAuthenticated);
  public userId = computed(() => this._authState().id);
  public userEmail = computed(() => this._authState().email);
  public userRole = computed(() => this._authState().role);
  public user = computed(() => this._authState().user);

  constructor() {
    this.restoreAuthState();
    effect((onCleanup) => {
      if (this.isLoggedIn()) {
        const intervalId = setInterval(() => {
          console.log('Checking and refreshing token...');
          this.checkAndRefreshToken();
        }, 5000);
        onCleanup(() => {
          clearInterval(intervalId);
          console.log('Clearing refresh token interval');
        });
      }
      return () => {};
    });
  }

  /**
   * Logs in the user by sending a sign-in request to the server.
   * If the login is successful, it saves the JWT token to local storage,
   * decodes the token to set the auth state, and navigates to the appropriate page.
   * If it's the user's first login, it redirects to the change password page.
   * If the login fails, it shows an error notification and resets the auth state.
   * @param req - The sign-in request containing the user's credentials.
   */
  public logIn(req: SignInRequest): void {
    this._httpClient.post<SignInResponse>(`${this.API_URL}/auth/sign-in`, req).subscribe({
      next: (response) => {
        const token = response.token;
        this.saveTokenToLocalStorage(token);
        this.decodeTokenAndSetState(token);
        this.fetchFullUserDetails();
        if (response.firstTimeLogin) {
          this._router.navigate(['/change-password']);
        } else {
          this._router.navigate(['/']);
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this._notificationService.showError(
            this._translationService.instant('api-errors.network-error')
          );
        } else {
          const apiError: ApiError = error?.error;
          this._notificationService.showError(this._translationService.instant(apiError.detail));
        }
        this._authState.set(initialState);
        this.clearTokenFromLocalStorage();
      },
    });
  }

  /**
   * Registers a new user by sending a registration request to the server.
   * If the registration is successful, it shows a success notification and navigates to the login page.
   * If the registration fails, it shows an error notification.
   * @param req - The user registration request containing the user's details.
   */
  public register(req: User): void {
    if (!req.email) {
      this._notificationService.showError(
        this._translationService.instant('auth-service.email-required')
      );
      return;
    }

    this._httpClient.post<User>(`${this.API_URL}/auth/register`, req).subscribe({
      next: () => {
        this._notificationService.showSuccess(
          this._translationService.instant('auth-service.registration-success')
        );
        this._router.navigate(['/sign-in']);
      },
      error: (error) => {
        if (error.status === 0) {
          this._notificationService.showError(
            this._translationService.instant('api-errors.network-error')
          );
        } else {
          const apiError: ApiError = error?.error;
          this._notificationService.showError(this._translationService.instant(apiError.detail));
        }
      },
    });
  }

  /**
   * Logs out the user by clearing the token from local storage,
   * resetting the auth state, and navigating to another route.
   * @param route - The route to navigate to after logging out. Sign in page by default.
   */
  public logOut(route: string = '/sign-in'): void {
    this.clearTokenFromLocalStorage();
    localStorage.removeItem('userDetails');
    this._userService.clearUserDetails();
    this._authState.set(initialState);
    this._router.navigate([route]);
  }

  /**
   * Sends a password reset email to the user.
   * If the request is successful, it shows a success notification.
   * If the request fails, it shows an error notification.
   * @param email - The email address of the user requesting the password reset.
   */
  public sendPasswordResetEmail(email: string): void {
    if (!email) {
      this._notificationService.showError(
        this._translationService.instant('auth-service.email-required')
      );
      return;
    }

    const resetRequest: InitiatePasswordResetRequest = {
      email: email,
    };

    this._httpClient.post<void>(`${this.API_URL}/auth/reset-password`, resetRequest).subscribe({
      next: () => {
        this._notificationService.showSuccess(
          this._translationService.instant('auth-service.password-reset-email-sent')
        );
      },
      error: (error) => {
        if (error.status === 0) {
          this._notificationService.showError(
            this._translationService.instant('api-errors.network-error')
          );
        } else {
          const apiError: ApiError = error?.error;
          this._notificationService.showError(this._translationService.instant(apiError.detail));
        }
      },
    });
  }

  /**
   * Resets the user's password by sending a patch request to the server.
   * If the reset is successful, it shows a success notification.
   * If the reset fails, it shows an error notification.
   * This method requires the user to be logged in.
   * @param newPassword - The new password to set for the user.
   */
  public resetPassword(newPassword: string): void {
    if (!this.isLoggedIn()) {
      this._notificationService.showError(
        this._translationService.instant('auth-service.must-be-logged-for-reset')
      );
      return;
    }

    if (!newPassword) {
      this._notificationService.showError(
        this._translationService.instant('auth-service.password-null-or-empty')
      );
      return;
    }

    const patchRequest: PasswordResetRequest = {
      password: newPassword,
      isFirstLogin: false,
    };

    this._authState.update((state) => ({
      ...state,
      user: {
        ...state.user,
        isFirstLogin: false,
      },
    }));

    this._httpClient.patch<User>(`${this.API_URL}/users/${this.userId()}`, patchRequest).subscribe({
      next: () => {
        this._notificationService.showSuccess(
          this._translationService.instant('auth-service.password-reset-success')
        );
        this.logOut();
      },
      error: (error) => {
        if (error.status === 0) {
          this._notificationService.showError(
            this._translationService.instant('api-errors.network-error')
          );
        } else {
          const apiError: ApiError = error?.error;
          this._notificationService.showError(
            this._translationService.instant('auth-service.password-reset-failed') +
              ': ' +
              this._translationService.instant(apiError.detail)
          );
        }
      },
    });
  }

  /**
   * Fetches the full user details from the server.
   * This method is called after a successful login to ensure the user details are complete.
   * If the user is not logged in, it shows an error notification.
   * @private
   */
  private fetchFullUserDetails(): void {
    if (!this.isLoggedIn()) {
      this._notificationService.showError(
        this._translationService.instant('auth-service.must-be-logged-for-details')
      );
      return;
    }
    this._httpClient.get<User>(`${this.API_URL}/users/${this.userId()}`).subscribe({
      next: (user) => {
        localStorage.setItem(environment.userDetailsLocalStorageKey, JSON.stringify(user));
        this._userService.loadUserDetails();
      },
      error: (error) => {
        if (error.status === 0) {
          this._notificationService.showError(
            this._translationService.instant('api-errors.network-error')
          );
        } else {
          const apiError: ApiError = error?.error;
          this._notificationService.showError(
            this._translationService.instant('auth-service.fetch-user-details-error') +
              this._translationService.instant(apiError.detail)
          );
        }
      },
    });
  }

  /**
   * Saves the JWT token to local storage.
   * @param token - The JWT token to save.
   * @private
   */
  private saveTokenToLocalStorage(token: string): void {
    localStorage.setItem(environment.tokenLocalStorageKey, token);
  }

  /**
   * Retrieves the JWT token from local storage.
   * @returns The JWT token if it exists, otherwise null.
   * @private
   */
  public getTokenFromLocalStorage(): string | null {
    return localStorage.getItem(environment.tokenLocalStorageKey);
  }

  /**
   * Clears the JWT token from local storage.
   * This is typically called when the user logs out.
   * @private
   */
  private clearTokenFromLocalStorage(): void {
    localStorage.removeItem(environment.tokenLocalStorageKey);
  }

  /**
   * Decodes the JWT token and updates the auth state.
   * @param token - The JWT token to decode.
   * @private
   */
  private decodeTokenAndSetState(token: string): void {
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      this._authState.set({
        isAuthenticated: true,
        id: decodedToken.sub,
        email: decodedToken.email,
        role: decodedToken.role,
        user: defaultUser,
      });
    } catch (error) {
      this._notificationService.showError(
        this._translationService.instant('auth-service.token-decode-error')
      );
      this._authState.set(initialState);
    }
  }

  /**
   * Checks if the user is authenticated by looking for a valid token in local storage.
   * If a valid token is found, it decodes the token and updates the auth state.
   * @private
   */
  private restoreAuthState(): void {
    const token = this.getTokenFromLocalStorage();
    if (token) {
      this.decodeTokenAndSetState(token);
    }
  }

  /**
   * Checks if the token is valid and refreshes it if necessary.
   * This method is called periodically to ensure the user remains authenticated.
   * If the token is invalid or expired, it logs the user out.
   * @private
   */
  private checkAndRefreshToken(): void {
    const token = this.getTokenFromLocalStorage();
    if (token) {
      this._httpClient.get<TokenResponse>(`${this.API_URL}/refresh-token`).subscribe({
        next: (response) => {
          if (response.renewed && this.isLoggedIn()) {
            this.saveTokenToLocalStorage(response.newToken);
            this.decodeTokenAndSetState(response.newToken);
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.status !== 0) {
            const apiError: ApiError = error?.error;
            this._notificationService.showError(this._translationService.instant(apiError.detail));
          }
          this.logOut();
        },
      });
    } else if (this.isLoggedIn()) {
      this.logOut();
    }
  }
}
