import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { CaseFormComponent } from './features/case-form/case-form.component';
import { roleBasedGuardGuard } from './shared/guards/role-based-guard.guard';
import { ForbiddenPageComponent } from './features/forbidden-page/forbidden-page.component';
import { alreadyAuthGuardGuard } from './shared/guards/already-auth-guard.guard';
import { userSeesHisOwnGuardGuard } from './shared/guards/user-sees-his-own-guard.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  // change these, only for testing purposes
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'form',
    component: CaseFormComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [alreadyAuthGuardGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/user-profile/user-profile.component').then((m) => m.UserProfileComponent),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./features/password-reset/change-password-page/change-password-page.component').then(
        (m) => m.ChangePasswordPageComponent
      ),
  },
  {
    path: 'request-password-reset',
    loadComponent: () =>
      import(
        './features/password-reset/request-pass-reset-page/request-pass-reset-page.component'
      ).then((m) => m.RequestPassResetPageComponent),
  },
  {
    path: 'employee-dashboard',
    loadComponent: () =>
      import('./features/employee-case-table/employee-case-table.component').then(
        (m) => m.EmployeeCaseTableComponent
      ),
    canActivate: [roleBasedGuardGuard],
    data: {
      roles: ['EMPLOYEE', 'ADMIN'],
    },
  },
  {
    path: 'forbidden',
    component: ForbiddenPageComponent,
  },
  {
    path: 'case-details/:caseId',
    loadComponent: () =>
      import('./features/case-details/case-details.component').then((m) => m.CaseDetailsComponent),
    canActivate: [userSeesHisOwnGuardGuard],
  },
  {
    path: 'admin-table',
    loadComponent: () =>
      import('./features/admin-table/admin-table.component').then((m) => m.AdminTableComponent),
  },
  { path: '**', component: NotFoundComponent },
];
