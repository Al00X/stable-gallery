import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { map } from 'rxjs';
import { FilterGroup } from '../interfaces';

export interface AppState {
  filterGroups: FilterGroup[];
  settings: AppSettings;
}

export interface AppSettings {
  dirs: string[];
  showNsfw: boolean;
  galleryItemPerRow: number;
  galleryItemAspectRatio: number;
  galleryItemGap: number;
  galleryColumns: number;
  galleryViewStyle?: 'grid' | 'masonry';
  gallerySortBy?: string;
  gallerySortDirection?: string;
  showSamplerInGallery?: boolean;
  openDetailsTabInGalleryByDefault: boolean;
  openDetailsTabInLightboxByDefault: boolean;
  imageControls: 'hover' | 'select' | 'none';
  detailsTabImageExpanded: boolean;
  peakNsfwWithKeybinding?: string;
}

const appStore = createStore(
  { name: 'app' },
  withProps<AppState>({
    filterGroups: [
      {
        index: 0,
        name: 'Nature',
        filters: { prompt: 'nature' },
      },
      {
        index: 1,
        name: 'Low CFGs',
        filters: { cfg: [0, 4] },
      },
      {
        index: 2,
        name: 'High Samples',
        filters: { steps: [50, undefined] },
      },
    ],
    settings: {
      dirs: [],
      showNsfw: false,
      galleryItemPerRow: 4,
      galleryItemGap: 1,
      galleryItemAspectRatio: 1,
      galleryColumns: 4,
      galleryViewStyle: 'grid',
      openDetailsTabInGalleryByDefault: false,
      openDetailsTabInLightboxByDefault: false,
      showSamplerInGallery: false,
      imageControls: 'hover',
      detailsTabImageExpanded: false,
      peakNsfwWithKeybinding: 'Alt',
    },
  }),
);

persistState(appStore, {
  storage: localStorageStrategy,
});

@Injectable({
  providedIn: 'root',
})
export class AppService {
  state$ = appStore.pipe();
  showNsfw$ = this.state$.pipe(map((t) => t.settings.showNsfw));
  showSampler$ = this.state$.pipe(map((t) => t.settings.showSamplerInGallery));
  filterGroups$ = this.state$.pipe(
    map((t) => t.filterGroups?.sort((a, b) => (a.index > b.index ? 1 : -1))),
  );
  imageControls$ = this.state$.pipe(
    map((t) => t.settings.imageControls),
  );

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

  addFilterGroup(group: Omit<FilterGroup, 'index'>) {
    const currentGroups = this.state.filterGroups;
    const lastIndex = currentGroups.length
      ? Math.max(...currentGroups.map((t) => t.index))
      : -1;
    currentGroups.push({
      ...group,
      index: lastIndex + 1,
    });
    appStore.update((state) => ({
      ...state,
      filterGroups: currentGroups,
    }));
  }
}
