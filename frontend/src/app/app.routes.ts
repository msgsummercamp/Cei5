import { Routes } from '@angular/router';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { CaseFormComponent } from './features/case-form/case-form.component';

export const routes: Routes = [
  // change these, only for testing purposes
  {
    path: '',
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
];
