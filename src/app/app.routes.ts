import { Routes } from '@angular/router';
import { authGuardFn } from '@auth0/auth0-angular'; 

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login').then((m) => m.Login)
  },
  {
    path: 'dashboard',
    canActivate: [authGuardFn],   
    loadComponent: () =>
      import('./dashboard/dashboard').then((m) => m.Dashboard)
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./callback/callback').then(m => m.Callback)
  }
];