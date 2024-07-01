import { Injectable } from '@angular/core';
import type { ipcRenderer } from 'electron';
import {BehaviorSubject, filter} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  electron: any;
  ipc: typeof ipcRenderer;

  userDataPath!: string;

  private _initialized$ = new BehaviorSubject(false);

  initialized$ = this._initialized$.pipe(filter(t => t))

  constructor() {
    this.electron = window.require('electron');
    this.ipc = this.electron.ipcRenderer;

    Promise.all([this.getUserDataPath()]).then(() => {
      this._initialized$.next(true);
    })
  }

  private async getUserDataPath() {
    this.userDataPath = await this.ipc.invoke('get-user-data-path');
  }
}
