import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import {debounceTime} from 'rxjs';

interface CacheState {
  scanned: string[];
}

const cacheStore = createStore(
  { name: 'cache' },
  withProps<CacheState>({
    scanned: [],
  })
);

persistState(cacheStore, {
  storage: localStorageStrategy,
  source: () => cacheStore.pipe(debounceTime(1000)),
});

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  state$ = cacheStore.pipe();

  get state() {
    return cacheStore.state;
  }

  addToScanned(path: string) {
    cacheStore.update((state) => {
      if (state.scanned.includes(path)) return state;
      return {
        ...state,
        scanned: state.scanned.concat(path),
      };
    });
  }

  removeFromScanned(path: string) {
    cacheStore.update((state) => {
      const index = state.scanned.indexOf(path);
      if (index === -1) return state;
      state.scanned.splice(index, 1);
      return {
        ...state,
        scanned: state.scanned,
      };
    });
  }

  reset() {
    cacheStore.reset();
  }
}
