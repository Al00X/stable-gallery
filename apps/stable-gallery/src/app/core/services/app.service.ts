import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import {map} from 'rxjs';

interface AppState {
  settings: {
    dirs: string[];
    showNsfw: boolean;
    galleryItemPerRow: number;
    galleryItemAspectRatio: number;
    galleryColumns: number;
    galleryViewStyle?: 'grid' | 'masonry';
    openDetailsTabInGalleryByDefault: boolean;
    openDetailsTabInLightboxByDefault: boolean;
  };
}

const appStore = createStore(
  { name: 'app' },
  withProps<AppState>({
    settings: {
      dirs: [],
      showNsfw: false,
      galleryItemPerRow: 4,
      galleryItemAspectRatio: 1,
      galleryColumns: 4,
      galleryViewStyle: 'grid',
      openDetailsTabInGalleryByDefault: false,
      openDetailsTabInLightboxByDefault: false,
    },
  })
);

persistState(appStore, {
  storage: localStorageStrategy,
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

  isSettingsValid() {
    const settings = this.state.settings;
    if (settings.dirs.length === 0) {
      return false;
    }
    return true;
  }
}
