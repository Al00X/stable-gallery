import {
  AnySQLiteColumn,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import {and, relations, SQL, sql} from 'drizzle-orm';

export const imagesEntry = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').unique().notNull(),
  seed: text('seed'),
  prompt: text('prompt'),
  negativePrompt: text('negative_prompt'),
  sampler: text('sampler'),
  cfg: integer('cfg'),
  clipSkip: integer('clip_skip'),
  steps: integer('steps'),
  width: integer('width'),
  height: integer('height'),
  modelHash: text('model_hash'),
  modelName: text('model_name'),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
export type ImagePartialEntry = typeof imagesEntry.$inferSelect;
export type ImagePartialEntryInsert = typeof imagesEntry.$inferInsert;

export const statEntry = sqliteTable('stats', {
  id: integer('id')
    .primaryKey()
    .references(() => imagesEntry.id, { onDelete: 'cascade' }),
  favorite: integer('favorite', { mode: 'boolean' }).default(false),
  nsfw: integer('nsfw', { mode: 'boolean' }).default(false),
});
export type StatsEntry = typeof statEntry.$inferSelect;
export type StatsEntryInsert = typeof statEntry.$inferInsert;

export const imagesAndStatRelation = relations(imagesEntry, (op) => ({
  stats: op.one(statEntry, {
    fields: [imagesEntry.id],
    references: [statEntry.id]
  })
}))

export type ImageEntry = ImagePartialEntry & StatsEntry;

export function lower(col: AnySQLiteColumn): any {
  return sql`lower(${col})`;
}

export function andLeast(and1: any, and2: any): any {
  if (and1 && !and2) {
    return and1
  } else if (!and1 && and2) {
    return and2;
  } else {
    return and(and1, and2)
  }
}
