import {inject, Injectable, NgZone} from '@angular/core';
import type FS from 'fs/promises';
import type PATH from 'path';
import type CHOKIDAR from 'chokidar';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private readonly ngZone = inject(NgZone);

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

  watch(dir: string | string[]) {
    const state = new BehaviorSubject<{
      latest?: string;
      memory: string[];
      latestAction?: 'add' | 'remove';
    }>({
      memory: [],
    });
    const watcher = this.chokidar.watch(dir).on('all', async (e, path, stats) => {
      this.ngZone.run(() => {
        if (e === 'add') {
          const memo = state.value.memory;
          memo.push(path);
          state.next({
            memory: memo,
            latest: path,
            latestAction: 'add',
          })
        } else if (e === 'unlink') {
          const memo = state.value.memory;
          const index = memo.indexOf(path);
          if (index !== -1) {
            memo.splice(index, 1);
            state.next({
              memory: memo,
              latest: path,
              latestAction: 'remove'
            });
          }
        }

      })
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
