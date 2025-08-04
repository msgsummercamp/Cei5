import { Routes } from '@angular/router';
import { CaseStartComponent } from './shared/components/case-start/case-start.component';
import { SignInComponent } from './feat/auth-components/sign-in/sign-in.component';

export const routes: Routes = [
  // change these, only for testing purposes
  {
    path: '',
    redirectTo: '/sign-in',
    pathMatch: 'full',
  },
  {
    path: 'form',
    component: CaseStartComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
];
