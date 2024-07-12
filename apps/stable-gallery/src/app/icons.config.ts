import { inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

// prettier-ignore
const baseIcons = [
  'star', 'star-outlined', 'settings', 'close', 'close-circle', 'grid', 'masonry', 'search', 'expand', 'shrink',
  'asc', 'desc', 'up', 'down', 'view', 'maximize', 'unmaximize', 'minimize'
];

export function registerIcons() {
  const sanitizer = inject(DomSanitizer);
  const iconRegistry = inject(MatIconRegistry);

  for (const icon of baseIcons) {
    iconRegistry.addSvgIcon(icon, sanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${icon}.svg`));
  }
}
