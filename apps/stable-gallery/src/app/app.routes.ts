import { Route } from '@angular/router';
import {lazyLoad} from "./core/helpers";

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => lazyLoad(import('./shared/components/layouts/main-layout/main-layout.component')),
    children: [
      {
        path: '',
        loadComponent: () => lazyLoad(import('./pages/home/home.component'))
      }
    ]
  }
];
