import { Route } from '@angular/router';
import { authGuard, noAuthGuard } from '@alfy/alfy-shared-lib';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./pages/auth').then((m) => m.Auth),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: {
      title: 'Dashboard',
      icon: 'pi pi-home',
    },
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'mfShopping',
    canActivate: [authGuard],
    data: {
      title: 'Lista della spesa',
      icon: 'pi pi-shopping-bag',
    },
    loadChildren: () =>
      import('mfShopping/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'mfExpenses',
    canActivate: [authGuard],
    data: {
      title: 'Gestione contabilità',
      icon: 'pi pi-money-bill',
    },
    loadChildren: () =>
      import('mfExpenses/Routes').then((m) => m!.remoteRoutes),
  },
];
