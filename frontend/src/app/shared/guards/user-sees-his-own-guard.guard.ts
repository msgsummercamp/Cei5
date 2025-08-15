import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { CaseService } from '../services/case.service';
import { Roles } from '../types/enums/roles';
import { catchError, map, of } from 'rxjs';
import { Case } from '../types/case';

export const userSeesHisOwnGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const caseService = inject(CaseService);

  const caseId = route.params['caseId'];
  const isAuthenticated = authService.isLoggedIn();

  return caseService.getCaseById(caseId).pipe(
    map((caseData: Case | null) => {
      if (!caseData) {
        return router.parseUrl('/not-found');
      }
      if (!isAuthenticated) {
        return router.parseUrl('/login');
      }
      const userId = authService.userId();
      const userRole = authService.userRole();
      if (userRole === Roles.USER && caseData.client.id !== userId) {
        return router.parseUrl('/forbidden');
      }
      return true;
    }),
    catchError(() => {
      return of(router.parseUrl('/not-found'));
    })
  );
};
