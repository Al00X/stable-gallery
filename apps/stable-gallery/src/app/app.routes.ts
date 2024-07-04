import { Route } from '@angular/router';
import {lazyLoad} from "./core/helpers";
import {SettingsValidGuard} from "./core/guards/settings-valid.guard";

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => lazyLoad(import('./shared/components/layouts/main-layout/main-layout.component')),
    children: [
      {
        path: '',
        canActivateChild: [SettingsValidGuard],
        children: [
          {
            path: '',
            loadComponent: () => lazyLoad(import('./pages/home/home.component'))
          }
        ]
      },
      {
        path: 'welcome',
        loadComponent: () => lazyLoad(import('./pages/welcome/welcome.component')),
      }
    ]
  }
];
