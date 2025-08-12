import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { CaseFormComponent } from './features/case-form/case-form.component';
import { UserCasesTableComponent } from './features/user-cases-table/user-cases-table.component';

export const routes: Routes = [
  // change these, only for testing purposes
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'verify-case',
    redirectTo: '/form',
    pathMatch: 'full',
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
    path: 'user-cases-table',
    component: UserCasesTableComponent,
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
];
