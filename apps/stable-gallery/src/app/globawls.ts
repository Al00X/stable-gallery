import { inject } from '@angular/core';
import { enableElfProdMode } from '@ngneat/elf';
import {DialogService} from "./shared/components/features/dialog";
import {DbService} from "./core/db";

export function setupGlobalServices() {
  (globalThis as any).dialog$ = inject(DialogService);
  (globalThis as any).db$ = inject(DbService);
  // (globalThis as any).snackbar$ = inject(SnackbarService);
}

export function setupProdMode(prod: boolean) {
  if (!prod) return;

  enableElfProdMode();
}

declare global {
  let dialog$: DialogService;
  let db$: DbService;
  // let snackbar$: SnackbarService;
}
