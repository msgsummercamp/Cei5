import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { CaseFormComponent } from './features/case-form/case-form.component';

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
];
