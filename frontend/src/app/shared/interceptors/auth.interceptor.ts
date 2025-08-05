import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthInterceptorConfigService } from '../services/auth/auth-interceptor-config.service';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authConfig = inject(AuthInterceptorConfigService);
  const authService = inject(AuthService);

  if (authConfig.isRouteExcluded(req.url)) {
    return next(req);
  }

  const authToken = authService.jwtToken();
  if (!authToken) {
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return next(clonedRequest);
};
