import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';

export const roleBasedGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] || [];

  if (!authService.isLoggedIn()) {
    return new RedirectCommand(router.parseUrl('/forbidden'));
  } else if (allowedRoles.length > 0 && !allowedRoles.includes(authService.userRole())) {
    return new RedirectCommand(router.parseUrl('/forbidden'));
  }
  return true;
};
