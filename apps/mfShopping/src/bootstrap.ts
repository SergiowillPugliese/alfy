import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { ShoppingPage } from './app/remote-entry/pages/shopping/shopping.page';


bootstrapApplication(ShoppingPage, appConfig).catch((err) => console.error(err));
