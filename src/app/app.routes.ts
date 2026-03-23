import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'

    },
    {
        path: 'login',
        loadComponent: () => //lazy loading
            import('./login/login.component').then((m) => m.LoginComponent)

    },

    {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadComponent: () =>
            import('./dashboard/dashboard.component').then((m) => m.DashboardComponent)
    }


];
