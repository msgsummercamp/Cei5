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
    });
  }

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

  public logOut(): void {
    this.clearTokenFromSessionStorage();
    this._authState.set(initialState);
    this._router.navigate(['/login']);
  }

  private saveTokenToSessionStorage(token: string): void {
    sessionStorage.setItem('authToken', token);
  }

  private getTokenFromSessionStorage(): string | null {
    return sessionStorage.getItem('authToken');
  }

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
