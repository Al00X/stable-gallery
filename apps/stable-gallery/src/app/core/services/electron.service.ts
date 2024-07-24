import { Injectable, signal } from '@angular/core';
import type { ipcRenderer } from 'electron';
import { BehaviorSubject, filter } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { environment } from '../../../../../stable-gallery-electron/src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  electron: any;
  ipc: typeof ipcRenderer;

  userDataPath!: string;
  tempPath!: string;
  environment!: typeof environment;
  changelogMd!: string;
  version!: string;

  isMaximized = signal(false);

  private _initialized$ = new BehaviorSubject(false);

  initialized$ = this._initialized$.pipe(filter((t) => t));

  constructor() {
    this.electron = window.require('electron');
    this.ipc = this.electron.ipcRenderer;

    Promise.all([
      this.getUserDataPath(),
      this.getTempPath(),
      this.getEnvironment(),
      this.getChangelog(),
      this.isWindowMaximized(),
    ]).then(() => {
      this._initialized$.next(true);
    });

    this.ipc.on('window', (e, message) => {
      this.isMaximized.set(message);
    });
  }

  async openDirectorySelectDialog() {
    return await this.ipc.invoke('open-directory-select-dialog');
  }

  setWindow(state: 'close' | 'maximize' | 'minimize') {
    this.ipc.invoke('window', state);
  }

  private async getUserDataPath() {
    this.userDataPath = await this.ipc.invoke('get-user-data-path');
  }

  private async getTempPath() {
    this.tempPath = await this.ipc.invoke('get-temp-path');
  }

  private async getEnvironment() {
    this.environment = await this.ipc.invoke('get-environment');
  }

  private async getChangelog() {
    this.changelogMd = await this.ipc.invoke('get-changelog');
    this.version = this.changelogMd.split('\n')[0].substring(1);
  }

  private async isWindowMaximized() {
    const res = await this.ipc.invoke('is-window-maximized');
    this.isMaximized.set(res);
  }
}
