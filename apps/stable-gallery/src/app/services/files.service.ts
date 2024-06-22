import { Injectable } from '@angular/core';
import type FS from 'fs/promises';
import type PATH from 'path';
import type CHOKIDAR from 'chokidar';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  public fs: typeof FS;
  public path: typeof PATH;
  public chokidar: typeof CHOKIDAR;

  constructor() {
    this.fs = window.require('fs/promises');
    this.path = window.require('path');
    this.chokidar = window.require('chokidar');
  }

  async scan(dir: string) {
    const result: string[] = [];
    for(const item of await this.fs.readdir(dir)) {
      const path = this.path.join(dir, item);
      if (await this.isDir(path)) {
        result.push(...await this.scan(path))
      } else {
        result.push(path);
      }
    }
    return result;
  }

  watch(dir: string) {
    const state = new BehaviorSubject<string[]>([]);
    const watcher = this.chokidar.watch(dir).on('all', async (e, path, stats) => {
      if (e === 'add') {
        state.next(state.value.concat([path]))
      } else if (e === 'unlink') {
        const value = state.value;
        const index = value.indexOf(path);
        if (index !== -1) {
          value.splice(index, 1);
          state.next(value);
        }
      }
    })

    return {
      state,
      unwatch: () => watcher.close()
    }
  }

  private async isDir(dir: string) {
    const res = await this.fs.lstat(dir);
    return res.isDirectory();
  }

  private exists(path: string) {
    return this.fs
      .access(path)
      .then(() => true)
      .catch(() => false);
  }
}
