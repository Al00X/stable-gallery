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
import {
  andLeast,
  ImageEntry,
  imagesEntry,
  lower, minMax,
  statEntry,
} from '../db/schema';
import { BehaviorSubject } from 'rxjs';
import { eq} from 'drizzle-orm';
import { MinMax } from '../interfaces';
import {flattenMinMax} from "../helpers";

export interface ImageQueryModel {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: 'createdAt' | 'addedAt';
  sortDirection?: 'asc' | 'desc';
  prompt?: string;
  negativePrompt?: string;
  sampler?: string;
  cfg?: MinMax;
  steps?: MinMax;
  preFilters?: ImageQueryModel[];
}

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
      this.setup();
    });
  }

  async addImageEntry(image: ImageItem) {
    return image
      .load()
      .then(async () => {
        const model = image.getModel();
        if (!model.createdAt) {
          model.createdAt = new Date();
        }
        if (!model.updatedAt) {
          model.updatedAt = new Date();
        }
        const insetRes = await this.db
          .insert(imagesEntry)
          .values({
            ...model,
            addedAt: new Date(),
          })
          .returning({ id: imagesEntry.id });
        const id = insetRes.at(0)?.id;
        if (id) {
          await this.db.insert(statEntry).values({
            id: id,
            favorite: false,
            nsfw: model.nsfw,
          });
        }
        return await this.getImage(id);
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  async update(image: ImageItem) {
    if (!image.id) return;
    return image
      .load()
      .then(async () => {
        const model = image.getModel();
        await this.db
          .update(imagesEntry)
          .set(model)
          .where(eq(imagesEntry.id, image.id!));
        await this.db
          .update(statEntry)
          .set(model)
          .where(eq(statEntry.id, image.id!));
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  // q is used as id or path
  async remove(q: number | string) {
    if (!q) return;
    return this.db
      .delete(imagesEntry)

      .where(
        typeof q === 'string' ? eq(imagesEntry.path, q) : eq(imagesEntry.id, q),
      )
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  async getImages(queryModel?: ImageQueryModel) {
    const query = flattenImageQuery(queryModel);
    console.log(query);

    return this.db.query.imagesEntry
      .findMany({
        limit: query?.perPage ?? 10,
        offset: (query?.perPage ?? 10) * (query?.page ? query.page - 1 : 0),
        orderBy: (items, op) => [
          (query?.sortDirection
            ? query.sortDirection === 'desc'
              ? op.desc
              : op.asc
            : op.desc)(
            query?.sortBy
              ? query.sortBy === 'createdAt'
                ? items.createdAt
                : items.addedAt
              : items.createdAt,
          ),
        ],
        with: {
          stats: true,
        },
        where: (items, { inArray, like, or, and, between, gte, lte }) => {
          const search = query?.search
            ? or(
                like(lower(items.prompt), `%${query.search.toLowerCase()}%`),
                like(
                  lower(items.negativePrompt),
                  `%${query.search.toLowerCase()}%`,
                ),
                like(lower(items.sampler), `%${query.search.toLowerCase()}%`),
                like(lower(items.seed), `%${query.search.toLowerCase()}%`),
                like(lower(items.modelHash), `%${query.search.toLowerCase()}%`),
              )
            : undefined;

          const promptQ =
            query?.prompt && query.prompt.length
              ? like(lower(items.prompt), `%${query.prompt.toLowerCase()}%`)
              : undefined;
          const negativePromptQ =
            query?.negativePrompt && query.negativePrompt.length
              ? like(
                  lower(items.negativePrompt),
                  `%${query.negativePrompt.toLowerCase()}%`,
                )
              : undefined;
          const samplerQ =
            query?.sampler && query.sampler.length
              ? like(lower(items.sampler), `%${query.sampler.toLowerCase()}%`)
              : undefined;
          const stepQ = minMax(query.steps, items.steps);

          const cfgQ = minMax(query.cfg, items.cfg);

          const filterArray = [
            promptQ,
            negativePromptQ,
            samplerQ,
            cfgQ,
            stepQ,
          ].filter((t) => !!t);
          const filter = and(...filterArray);

          return filter
            ? andLeast(
                filter,
                inArray(
                  items.id,
                  this.db
                    .select({ id: imagesEntry.id })
                    .from(imagesEntry)
                    .where(search),
                ),
              )
            : search;
        },
      })
      .then((res) => {
        return res.map((t) =>
          ImageItem.fromImageEntry({
            ...t,
            ...t.stats,
          } as ImageEntry),
        );
      });
  }

  async getImage(q: string | number | undefined) {
    if (!q) return;
    return this.db
      .select()
      .from(imagesEntry)
      .where(
        typeof q === 'string' ? eq(imagesEntry.path, q) : eq(imagesEntry.id, q),
      )
      .limit(1)
      .leftJoin(statEntry, eq(imagesEntry.id, statEntry.id))
      .then((res) => {
        const t = res.at(0);
        if (!t) return undefined;
        return ImageItem.fromImageEntry({
          ...t.entries,
          ...t.stats,
        } as ImageEntry);
      });
  }

  async reset() {
    this.initialized$.next(false);
    this.sqlite.close();
    await fs$.delete(this.getDatabasePath());
    this.setup();
  }

  private getDatabasePath() {
    const dbName = `index${
      !this.electron.environment.production ? '_dev' : ''
    }.sqlite`;
    return `${this.electron.userDataPath}\\${dbName}`;
  }

  private setup() {
    this.sqlite = new this.betterSqlite3(this.getDatabasePath());
    this.db = this.drizzle(this.sqlite, {
      schema: schema,
    });
    this.runMigration();
    setTimeout(() => {
      this.initialized$.next(true);
    }, 1);
  }

  private runMigration() {
    const migrations = readMigrationFiles();
    // @ts-ignore
    this.db.dialect.migrate(migrations, this.db.session);
  }
}

function flattenImageQuery(model: ImageQueryModel | undefined): ImageQueryModel {
  const q = [model, ...model?.preFilters ?? []];
  return {
    ...model,
    prompt: q.map(t => t?.prompt).filter(t => !!t).join(','),
    negativePrompt: q.map(t => t?.negativePrompt).filter(t => !!t).join(','),
    sampler: q.map(t => t?.sampler).filter(t => !!t).join(','),
    steps: flattenMinMax(q.map(t => t?.steps)),
    cfg: flattenMinMax(q.map(t => t?.cfg)),
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
        `No file ${migrationPath} found in ${migrationFolderTo} folder`,
      );
    }
  }

  return migrationQueries;
}
