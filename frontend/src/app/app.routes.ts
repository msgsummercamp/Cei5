import { Routes } from '@angular/router';
import { CaseStartComponent } from './shared/components/case-start/case-start.component';
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
    component: CaseStartComponent,
  },
  {
    path: 'navbar-test',
    component: NavbarTestComponent,
  },
];
