import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import {debounceTime, map} from 'rxjs';

interface AppState {
  scanned: string[];
  settings: {
    dirs: string[];
    showNsfw: boolean;
    galleryItemPerRow: number;
    galleryItemAspectRatio: number;
  };
}

const appStore = createStore(
  { name: 'app' },
  withProps<AppState>({
    scanned: [],
    settings: {
      dirs: [],
      showNsfw: false,
      galleryItemPerRow: 4,
      galleryItemAspectRatio: 1,
    },
  })
);

persistState(appStore, {
  storage: localStorageStrategy,
  source: () => appStore.pipe(debounceTime(1000)),
});

@Injectable({
  providedIn: 'root',
})
export class AppService {
  state$ = appStore.pipe();
  showNsfw$ = this.state$.pipe(map(t => t.settings.showNsfw));

  get state() {
    return appStore.state;
  }

  addToScanned(path: string) {
    appStore.update((state) => {
      if (state.scanned.includes(path)) return state;
      return {
        ...state,
        scanned: state.scanned.concat(path),
      };
    });
  }

  removeFromScanned(path: string) {
    appStore.update((state) => {
      const index = state.scanned.indexOf(path);
      if (index === -1) return state;
      state.scanned.splice(index, 1);
      return {
        ...state,
        scanned: state.scanned,
      };
    });
  }

  setSettings(settings: Partial<AppState['settings']>) {
    appStore.update((state) => ({
      ...state,
      settings: {
        ...state.settings,
        ...settings,
      },
    }));
  }

  reset() {
    appStore.reset();
  }
}
