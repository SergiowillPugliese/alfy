import { Route } from '@angular/router';
import { ShoppingPage } from './pages/shopping/shopping.page';
import { ShoppingListPage } from './pages/shopping-list/shopping-list.page';

export const remoteRoutes: Route[] = [
    { 
        path: '', 
        component: ShoppingPage,
    },
    {
        path: ':id/:name',
        component: ShoppingListPage
    }
];
