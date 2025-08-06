import { Routes } from '@angular/router';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { CaseFormComponent } from './features/case-form/case-form.component';
import { TestNavbarComponent } from './test_navbar/test_navbar.component';

export const routes: Routes = [
  // change these, only for testing purposes
  {
    path: '',
    redirectTo: '/test_navbar',
    pathMatch: 'full',
  },
  {
    path: 'test_navbar',
    component: TestNavbarComponent,
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
