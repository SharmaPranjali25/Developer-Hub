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
  // added Route Guard to protect the dashboard route, only authenticated users can access it. If an unauthenticated user tries to access the dashboard, they will be redirected to the login page.
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