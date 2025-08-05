import { Routes } from '@angular/router';
import { CaseFormComponent } from './features/case-form/case-form.component';
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
    component: CaseFormComponent,
  },
  {
    path: 'navbar-test',
    component: NavbarTestComponent,
  },
];
