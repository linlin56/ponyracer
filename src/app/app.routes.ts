import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'races',
    canActivate: [authGuard],
    loadComponent: () => import('./components/races/races.component').then((m) => m.RacesComponent),
  },
  {
    path: 'races/:raceId',
    canActivate: [authGuard],
    loadComponent: () => import('./components/race/race.component').then((m) => m.RaceComponent),
  },
  {
    path: 'races/:raceId/live',
    canActivate: [authGuard],
    loadComponent: () => import('./components/live/live.component').then((m) => m.LiveComponent),
  },
  { path: '**', redirectTo: '' },
];
