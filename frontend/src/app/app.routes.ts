import { Routes } from '@angular/router';
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
];
