import { inject, Injectable } from '@angular/core';
import type {
  BetterSQLite3Database,
  drizzle,
} from 'drizzle-orm/better-sqlite3';
import { ElectronService } from '../services/electron.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as schema from '../db/schema';
import type { MigrationMeta } from 'drizzle-orm/migrator';
import { ImageItem } from '../helpers/image.helper';
import { imagesEntry } from '../db/schema';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private readonly electron = inject(ElectronService);

  private drizzle: typeof drizzle;
  private betterSqlite3: any;

  sqlite!: any;
  db!: BetterSQLite3Database<typeof schema>;

  initialized$ = new BehaviorSubject(false);

  constructor() {
    this.drizzle = window.require('drizzle-orm/better-sqlite3').drizzle;
    this.betterSqlite3 = window.require('better-sqlite3');

    this.electron.initialized$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.sqlite = new this.betterSqlite3(
        `${this.electron.userDataPath}\\index.sqlite`
      );
      this.db = this.drizzle(this.sqlite, {
        schema: schema,
      });
      this.runMigration();
      setTimeout(() => {
        this.initialized$.next(true);
      }, 1)
    });
  }

  async addImageEntry(image: ImageItem) {
    return image.load().then(() => {
      return this.db.insert(imagesEntry).values({
        ...image.getModel(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  async getImages(query?: { page?: number; perPage?: number }) {
    return this.db
      .select()
      .from(imagesEntry)
      .limit(query?.perPage ?? 10)
      .offset((query?.perPage ?? 10) * (query?.page ? query.page - 1 : 0))
      .then((res) => {
        return res.map((t) => ImageItem.fromImageEntry(t));
      });
  }

  private runMigration() {
    const migrations = readMigrationFiles();
    // @ts-ignore
    this.db.dialect.migrate(migrations, this.db.session);
  }
}

function readMigrationFiles(): MigrationMeta[] {
  const fs = window.require('fs');
  const crypto = window.require('crypto');

  const migrationFolderTo = './apps/stable-gallery/src/app/core/db/migrations';

  const migrationQueries: MigrationMeta[] = [];

  const journalPath = `${migrationFolderTo}/meta/_journal.json`;
  if (!fs.existsSync(journalPath)) {
    throw new Error(`Can't find meta/_journal.json file`);
  }

  const journalAsString = fs
    .readFileSync(`${migrationFolderTo}/meta/_journal.json`)
    .toString();

  const journal = JSON.parse(journalAsString) as {
    entries: { idx: number; when: number; tag: string; breakpoints: boolean }[];
  };

  for (const journalEntry of journal.entries) {
    const migrationPath = `${migrationFolderTo}/${journalEntry.tag}.sql`;

    try {
      const query = fs
        .readFileSync(`${migrationFolderTo}/${journalEntry.tag}.sql`)
        .toString();

      const result = query.split('--> statement-breakpoint').map((it: any) => {
        return it;
      });

      migrationQueries.push({
        sql: result,
        bps: journalEntry.breakpoints,
        folderMillis: journalEntry.when,
        hash: crypto.createHash('sha256').update(query).digest('hex'),
      });
    } catch {
      throw new Error(
        `No file ${migrationPath} found in ${migrationFolderTo} folder`
      );
    }
  }

  return migrationQueries;
}
