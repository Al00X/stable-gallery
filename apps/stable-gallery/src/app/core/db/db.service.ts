import { inject, Injectable } from '@angular/core';
import type {
  BetterSQLite3Database,
  drizzle,
} from 'drizzle-orm/better-sqlite3';
import { ElectronService } from '../services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as schema from '../db/schema';
import type { MigrationMeta } from 'drizzle-orm/migrator';
import {ImageItem, sleep} from '../helpers';
import {
  ImageEntry,
  imagesEntry,
  imagesToTagsEntry,
  lower,
  minMax,
  statEntry,
  tagEntry,
} from './schema';
import { BehaviorSubject } from 'rxjs';
import { eq, sql } from 'drizzle-orm';
import { MinMax } from '../interfaces';
import { flattenMinMax } from '../helpers';
import {TagEntry} from "../db/schema";

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

        const promptTags = promptTokenizer(model.prompt, true).map(t => ({ name: t } as TagEntry));
        const negativeTags = promptTokenizer(model.negativePrompt, true).map(t => ({ name: t } as TagEntry));

        const promptTagInsertRes = promptTags.length
          ? await this.db
              .insert(tagEntry)
              .values(promptTags)
              .returning({ id: tagEntry.id, name: tagEntry.name })
              .onConflictDoUpdate({
                target: tagEntry.name,
                set: {
                  name: sql`excluded.name`,
                },
              })
          : undefined;
        const negativeTagInsertRes = negativeTags.length
          ? await this.db
              .insert(tagEntry)
              .values(negativeTags)
              .returning({ id: tagEntry.id, name: tagEntry.name })
              .onConflictDoUpdate({
                target: tagEntry.name,
                set: {
                  name: sql`excluded.name`,
                },
              })
          : undefined;
        const id = insetRes.at(0)?.id;
        if (id) {
          await this.db.insert(statEntry).values({
            id: id,
            favorite: false,
            nsfw: model.nsfw,
          });
          const tagValues = [
            ...(promptTagInsertRes?.map((t) => ({
              imageId: id,
              tagId: t.id,
              negative: false,
            })) ?? []),
            ...(negativeTagInsertRes?.map((t) => ({
              imageId: id,
              tagId: t.id,
              negative: true,
            })) ?? []),
          ];
          tagValues.length
            ? await this.db.insert(imagesToTagsEntry).values(tagValues)
            : null;
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
          tags: {
            with: {
              tag: true,
            },
          },
        },
        where: (items, { inArray, like, or, and, between, gte, lte }) => {
          const search = query?.search
            ? or(
                like(lower(items.sampler), `%${query.search.toLowerCase()}%`),
                like(lower(items.seed), `%${query.search.toLowerCase()}%`),
                like(lower(items.modelHash), `%${query.search.toLowerCase()}%`),
                inArray(
                  items.id,
                  this.db
                    .select({ id: imagesToTagsEntry.imageId })
                    .from(imagesToTagsEntry)
                    .leftJoin(
                      tagEntry,
                      eq(tagEntry.id, imagesToTagsEntry.tagId),
                    )
                    .where(
                      like(
                        lower(tagEntry.name),
                        `%${query.search!.toLowerCase()}%`,
                      ),
                    ),
                ),
              )
            : undefined;

          const promptQ =
            query?.prompt && query.prompt.length
              ? inArray(
                  items.id,
                  this.db
                    .select({ id: imagesToTagsEntry.imageId })
                    .from(imagesToTagsEntry)
                    .leftJoin(
                      tagEntry,
                      eq(tagEntry.id, imagesToTagsEntry.tagId),
                    )
                    .where(
                      and(
                        eq(imagesToTagsEntry.negative, false),
                        or(
                          ...query.promptTokens.map(
                            (t) => like(lower(tagEntry.name), `${t}%`),
                          ),
                        ),
                      ),
                    ),
                )
              : undefined;
          const negativePromptQ =
            query?.negativePrompt && query.negativePrompt.length
              ? inArray(
                  items.id,
                  this.db
                    .select({ id: imagesToTagsEntry.imageId })
                    .from(imagesToTagsEntry)
                    .leftJoin(
                      tagEntry,
                      eq(tagEntry.id, imagesToTagsEntry.tagId),
                    )
                    .where(
                      and(
                        eq(imagesToTagsEntry.negative, true),
                        or(
                          ...query.negativePromptTokens
                            .map((t) =>
                              like(lower(tagEntry.name), `${t}%`),
                            ),
                        ),
                      ),
                    ),
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

          return and(filter, search);
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

    return this.db.query.imagesEntry
      .findFirst({
        where: (item, op) => {
          return typeof q === 'string'
            ? op.eq(item.path, q)
            : op.eq(item.id, q);
        },
        with: {
          stats: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
      })
      .then((res) => {
        if (!res) return undefined;
        return ImageItem.fromImageEntry({
          ...res,
          ...res.stats,
        } as ImageEntry);
      });
  }

  async reset() {
    console.log(this.sqlite, this.db);
    this.sqlite.close();
    await sleep(200);
    await fs$.delete(this.getDatabasePath());
    this.initialized$.next(false);
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

function promptTokenizer(prompt: string | undefined, removeStopWords = false) {
  if (!prompt) return [];

  // prettier-ignore
  const stopwords = [
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'were', 'will', 'with'
    ];

  const stopwordRegex = new RegExp(`^(${stopwords.join('|')})$`, 'i');

  const words = prompt
    .replaceAll(/(\(|\)|\[|\]|)/g, '')
    .replaceAll(/<[^:>]*:|(:[^>]*)?>/g, '')
    .replaceAll(/:[0-9\.]+/g, '')
    .split(/(\s|,|\.|:)+/)
    .map((t) => t.toLowerCase().trim())
    .filter((t) => !!t.length && (removeStopWords ? !stopwordRegex.test(t) : true));

  return words;
}

function flattenImageQuery(
  model: ImageQueryModel | undefined,
): ImageQueryModel & { promptTokens: string[]; negativePromptTokens: string[] } {
  const q = [model, ...(model?.preFilters ?? [])];

  const prompt = q
      .map((t) => t?.prompt)
      .filter((t) => !!t)
      .join(',');
  const negativePrompt = q
      .map((t) => t?.negativePrompt)
      .filter((t) => !!t)
      .join(',')

  const promptTokens = promptTokenizer(prompt)
  const negativePromptTokens = promptTokenizer(negativePrompt)

  return {
    ...model,
    prompt,
    negativePrompt,
    promptTokens,
    negativePromptTokens,
    sampler: q
      .map((t) => t?.sampler)
      .filter((t) => !!t)
      .join(','),
    steps: flattenMinMax(q.map((t) => t?.steps)),
    cfg: flattenMinMax(q.map((t) => t?.cfg)),
  };
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
