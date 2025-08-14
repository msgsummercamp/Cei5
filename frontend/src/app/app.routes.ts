import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { CaseFormComponent } from './features/case-form/case-form.component';

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
  },
  {
    path: 'admin-table',
    loadComponent: () =>
      import('./features/admin-table/admin-table.component').then((m) => m.AdminTableComponent),
  },
];
