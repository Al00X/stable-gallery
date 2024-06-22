import { Injectable } from '@angular/core';
import type FS from 'fs/promises';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private fs: typeof FS
  constructor() {
    this.fs = window.require('fs/promises');
  }

  async scan(dir: string) {
    console.log(await this.fs.readdir(dir))
  }
}
