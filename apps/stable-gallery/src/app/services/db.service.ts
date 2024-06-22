import {inject, Injectable} from '@angular/core';
import type {BetterSQLite3Database, drizzle} from 'drizzle-orm/better-sqlite3';
import {ElectronService} from "./electron.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private readonly electron = inject(ElectronService);

  private drizzle: typeof drizzle;
  private betterSqlite3: any;

  sqlite!: any;
  db!: BetterSQLite3Database;

  constructor() {
    this.drizzle = window.require('drizzle-orm/better-sqlite3').drizzle;
    this.betterSqlite3 = window.require('better-sqlite3');

    this.electron.initialized$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.sqlite = new this.betterSqlite3(`${this.electron.userDataPath}\\index.sqlite`);
      this.db = this.drizzle(this.sqlite)
    })
  }
}
