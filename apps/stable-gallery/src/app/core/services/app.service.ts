import { Injectable } from '@angular/core';
import {createStore, withProps} from "@ngneat/elf";
import {localStorageStrategy, persistState} from "@ngneat/elf-persist-state";
import {debounceTime} from "rxjs";

interface AppState {
  scanned: string[];
  dirs: string[];
}

const appStore = createStore(
  { name: 'app' },
  withProps<AppState>({ scanned: [], dirs: [], })
);

persistState(appStore, {
  storage: localStorageStrategy,
  source: () => appStore.pipe(debounceTime(1000)),
})

@Injectable({
  providedIn: 'root'
})
export class AppService {
  state$ = appStore.pipe();

  get state() {
    return appStore.state
  }

  addToScanned(path: string) {
    appStore.update((state) => {
      if (state.scanned.includes(path)) return state;
      return {
        ...state,
        scanned: state.scanned.concat(path)
      }
    })
  }

  removeFromScanned(path: string) {
    appStore.update((state) => {
      const index = state.scanned.indexOf(path);
      if (index === -1) return state;
      state.scanned.splice(index, 1);
      return {
        ...state,
        scanned: state.scanned
      }
    })
  }

  setDirs(dirs: string[]) {
    appStore.update((state) => ({
      ...state,
      dirs,
    }))
  }

  reset() {
    appStore.reset();
  }
}
