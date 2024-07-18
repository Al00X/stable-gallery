import { inject } from '@angular/core';
import { enableElfProdMode } from '@ngneat/elf';
import { DialogService } from './shared/components/features';
import { DbService } from './core/db';
import { FilesService } from './core/services';

export function setupGlobalServices() {
  (globalThis as any).dialog$ = inject(DialogService);
  (globalThis as any).db$ = inject(DbService);
  (globalThis as any).fs$ = inject(FilesService);
  // (globalThis as any).snackbar$ = inject(SnackbarService);
}

export function setupProdMode(prod: boolean) {
  if (!prod) return;

  enableElfProdMode();
}

declare global {
  let dialog$: DialogService;
  let db$: DbService;
  let fs$: FilesService;
  // let snackbar$: SnackbarService;
}
