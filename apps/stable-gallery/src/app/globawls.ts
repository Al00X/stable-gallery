import { inject } from '@angular/core';
import { enableElfProdMode } from '@ngneat/elf';
import {DialogService} from "./shared/components/features/dialog";

export function setupGlobalServices() {
  (globalThis as any).dialog$ = inject(DialogService);
  // (globalThis as any).snackbar$ = inject(SnackbarService);
}

export function setupProdMode(prod: boolean) {
  if (!prod) return;

  enableElfProdMode();
}

declare global {
  let dialog$: DialogService;
  // let snackbar$: SnackbarService;
}
