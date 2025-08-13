import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const alreadyAuthGuardGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const routeName = route.routeConfig?.path;
  const isAuthenticated = authService.isLoggedIn();

  if (routeName === 'sign-in' && isAuthenticated) {
    return router.parseUrl('/');
  }

  return true;
};
