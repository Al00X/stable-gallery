import {inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {fromEvent} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AppService} from "./app.service";

@Injectable({
  providedIn: 'root'
})
export class KeybindService {
  private app = inject(AppService)

  peakNsfw = signal(false);
  ctrl = signal(false);
  shift = signal(false);

  private _keys: {[key: string]: WritableSignal<boolean>} = {};

  constructor() {
    fromEvent<KeyboardEvent>(document, 'keydown').pipe(takeUntilDestroyed()).subscribe(e => {
      this.shift.set(e.shiftKey);
      this.ctrl.set(e.ctrlKey);
      this.toggleKey(e.key, true);
    })
    fromEvent<KeyboardEvent>(document, 'keyup').pipe(takeUntilDestroyed()).subscribe(e => {
      this.shift.set(e.shiftKey);
      this.ctrl.set(e.ctrlKey);
      this.toggleKey(e.key, false);
    })
    fromEvent<Event>(window, 'blur').pipe(takeUntilDestroyed()).subscribe(e => {
      this.reset();
    })
    this.app.state$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.updateKeyBinds();
    })
  }

  updateKeyBinds() {
    this._keys = {
      [this.app.state.settings.peakNsfwWithKeybinding ?? '']: this.peakNsfw
    }
  }

  private toggleKey(key: string, state: boolean) {
    if (key.length && key in this._keys) {
      const sig = this._keys[key];
      if (sig() === state) return;
      sig.set(state);
    }
  }

  private reset() {
    for(const sig of Object.values(this._keys)) {
      sig.set(false)
    }
  }
}
