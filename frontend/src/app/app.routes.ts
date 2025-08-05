import { Routes } from '@angular/router';
import { SignInComponent } from './features/sign-in/sign-in.component';
import { CaseFormComponent } from './features/case-form/case-form.component';
import { NavbarTestComponent } from './shared/components/navbar-test/navbar.test.component';

export const routes: Routes = [
  // change these, only for testing purposes
  {
    path: '',
    redirectTo: '/navbar-test',
    pathMatch: 'full',
  },
  {
    path: 'form',
    component: CaseFormComponent,
  },
  {
    path: 'navbar-test',
    component: NavbarTestComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
];
