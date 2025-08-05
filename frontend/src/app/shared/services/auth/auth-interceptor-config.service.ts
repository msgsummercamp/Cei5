import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorConfigService {
  private readonly excludedRoutes = ['/auth/sign-in', '/auth/register', '/auth/reset-password'];

  public isRouteExcluded(route: string): boolean {
    return this.excludedRoutes.some((excludedRoute) => route.includes(excludedRoute));
  }
}
