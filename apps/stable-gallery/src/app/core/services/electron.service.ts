import { Injectable } from '@angular/core';
import type { ipcRenderer } from 'electron';
import {BehaviorSubject, filter} from "rxjs";
import type {environment} from "../../../../../stable-gallery-electron/src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  electron: any;
  ipc: typeof ipcRenderer;

  userDataPath!: string;
  environment!: typeof environment;

  private _initialized$ = new BehaviorSubject(false);

  initialized$ = this._initialized$.pipe(filter(t => t))

  constructor() {
    this.electron = window.require('electron');
    this.ipc = this.electron.ipcRenderer;

    Promise.all([this.getUserDataPath(), this.getEnvironment()]).then(() => {
      this._initialized$.next(true);
    })
  }

  async openDirectorySelectDialog() {
    return await this.ipc.invoke('open-directory-select-dialog')
  }

  private async getUserDataPath() {
    this.userDataPath = await this.ipc.invoke('get-user-data-path');
  }

  private async getEnvironment() {
    this.environment = await this.ipc.invoke('get-environment');
  }
}
