import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AppService } from '../services';

export const SettingsValidGuard: CanActivateFn = () => {
  const router = inject(Router);
  const app = inject(AppService);

  if (!app.isSettingsValid()) {
    return router.createUrlTree(['/welcome']);
  }
  return true;
};
