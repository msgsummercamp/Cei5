import { Routes } from '@angular/router';
import { CaseStartComponent } from './shared/components/case-start/case-start.component';
import { HomePageComponent } from './features/home-page/home-page.component';

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
    component: CaseStartComponent,
  },
];
