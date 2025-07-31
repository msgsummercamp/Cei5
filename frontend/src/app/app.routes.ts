import { Routes } from '@angular/router';
import { CaseStartComponent } from './shared/components/case-start/case-start.component';

export const routes: Routes = [
  // change these, only for testing purposes
  {
    path: '',
    redirectTo: '/form',
    pathMatch: 'full',
  },
  {
    path: 'form',
    component: CaseStartComponent,
  },
];
