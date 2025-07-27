import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    data: {
      title: 'Dashboard',
      icon: 'pi pi-home',
    },
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'mfShopping',
    data: {
      title: 'Shopping',
      icon: 'pi pi-shopping-bag',
    },
    loadChildren: () =>
      import('mfShopping/Routes').then((m) => m!.remoteRoutes),
  },
];
