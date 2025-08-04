import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { AuthState } from '../models/auth-state';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DecodedToken } from '../models/decoded-token';
import { jwtDecode } from 'jwt-decode';
import { SignInRequest } from '../models/sign-in-request';
import { SignInResponse } from '../models/sign-in-response';
import { User } from '../../../../shared/models/user';
import { NotificationService } from '../../notifications/services/notification.service';
import { InitiatePasswordResetRequest, PasswordResetRequest } from '../models/password-reset';

const initialState: AuthState = {
  isAuthenticated: false,
  id: '',
  email: '',
  token: '',
  role: '',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedIn: Signal<boolean>;
  public userId: Signal<string>;
  public userEmail: Signal<string>;
  public jwtToken: Signal<string>;
  public userRole: Signal<string>;

  private readonly _authState = signal<AuthState>(initialState);
  private readonly _httpClient = inject(HttpClient);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly API_URL: string = environment.API_URL;

  constructor() {
    this.restoreAuthState();

    this.isLoggedIn = computed(() => this._authState().isAuthenticated);
    this.userId = computed(() => this._authState().id);
    this.userEmail = computed(() => this._authState().email);
    this.jwtToken = computed(() => this._authState().token);
    this.userRole = computed(() => this._authState().role);
  }

  /**
   * Logs in the user by sending a sign-in request to the server.
   * If the login is successful, it saves the JWT token to session storage,
   * decodes the token to set the auth state, and navigates to the appropriate page.
   * If it's the user's first login, it redirects to the change password page.
   * If the login fails, it shows an error notification and resets the auth state.
   * @param req - The sign-in request containing the user's credentials.
   */
  public logIn(req: SignInRequest): void {
    this._httpClient.post<SignInResponse>(`${this.API_URL}/auth/signin`, req).subscribe({
      next: (response) => {
        const token = response.token;
        this.saveTokenToSessionStorage(token);
        this.decodeTokenAndSetState(token);
        if (response.isFirstLogin) {
          this._router.navigate(['/change-password']);
        } else {
          this._router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this._notificationService.showError('Login failed: ' + error.message);
        this._authState.set(initialState);
        this.clearTokenFromSessionStorage();
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
    this._httpClient.post<User>(`${this.API_URL}/auth/register`, req).subscribe({
      next: () => {
        this._notificationService.showSuccess('Registration successful');
        this._router.navigate(['/login']);
      },
      error: (error) => {
        this._notificationService.showError('Registration failed: ' + error.message);
      },
    });
  }

  /**
   * Logs out the user by clearing the token from session storage,
   * resetting the auth state, and navigating to the login page.
   */
  public logOut(): void {
    this.clearTokenFromSessionStorage();
    this._authState.set(initialState);
    this._router.navigate(['/login']);
  }

  /**
   * Sends a password reset email to the user.
   * If the request is successful, it shows a success notification.
   * If the request fails, it shows an error notification.
   * @param email - The email address of the user requesting the password reset.
   */
  public sendPasswordResetEmail(email: string): void {
    const resetRequest: InitiatePasswordResetRequest = {
      email: email,
    };

    this._httpClient.post<void>(`${this.API_URL}/auth/forgot-password`, resetRequest).subscribe({
      next: () => {
        this._notificationService.showSuccess('Password reset email sent successfully');
      },
      error: (error) => {
        this._notificationService.showError(
          'Failed to send password reset email: ' + error.message
        );
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
    if (!this.isLoggedIn) {
      this._notificationService.showError('You must be logged in to reset your password.');
      return;
    }

    const patchRequest: PasswordResetRequest = {
      newPassword: newPassword,
      isFirstLogin: false,
    };

    this._httpClient.patch<User>(`${this.API_URL}/users/${this.userId}`, patchRequest).subscribe({
      next: () => {
        this._notificationService.showSuccess('Password reset successful');
      },
      error: (error) => {
        this._notificationService.showError('Password reset failed: ' + error.message);
      },
    });
  }

  /**
   * Saves the JWT token to session storage.
   * @param token - The JWT token to save.
   * @private
   */
  private saveTokenToSessionStorage(token: string): void {
    sessionStorage.setItem('authToken', token);
  }

  /**
   * Retrieves the JWT token from session storage.
   * @returns The JWT token if it exists, otherwise null.
   * @private
   */
  private getTokenFromSessionStorage(): string | null {
    return sessionStorage.getItem('authToken');
  }

  /**
   * Clears the JWT token from session storage.
   * This is typically called when the user logs out.
   * @private
   */
  private clearTokenFromSessionStorage(): void {
    sessionStorage.removeItem('authToken');
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
        token: token,
        role: decodedToken.role,
      });
    } catch (error) {
      this._authState.set(initialState);
    }
  }

  /**
   * Checks if the user is authenticated by looking for a valid token in session storage.
   * If a valid token is found, it decodes the token and updates the auth state.
   * @private
   */
  private restoreAuthState(): void {
    const token = this.getTokenFromSessionStorage();
    if (token) {
      this.decodeTokenAndSetState(token);
    }
  }
}
