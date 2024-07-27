import {
  AnySQLiteColumn,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';
import { and, between, gte, lte, relations, sql } from 'drizzle-orm';
import { MinMax } from '../interfaces';

export const tagEntry = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').unique().notNull(),
})
export type TagEntry = {
  id?: number;
  name: string;
}

export const imagesEntry = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').unique().notNull(),
  seed: text('seed'),
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

export const imagesRelations = relations(imagesEntry, (op) => ({
  stats: op.one(statEntry, {
    fields: [imagesEntry.id],
    references: [statEntry.id],
  }),
  tags: op.many(imagesToTagsEntry)
}));

export type ImageEntry = ImagePartialEntry & StatsEntry & { tags: ImageToTagsEntry[] };

export const imagesToTagsEntry = sqliteTable('images_to_tags', {
  imageId: integer('image_id').notNull().references(() => imagesEntry.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tagEntry.id, { onDelete: 'cascade' }),
  negative: integer('is_negative', {mode: 'boolean'}).default(false)
})
export type ImageToTagsEntry = typeof imagesToTagsEntry.$inferSelect;

const imagesToTagsRelations = relations(imagesToTagsEntry, (op) => ({
  image: op.one(imagesEntry, {
    fields: [imagesToTagsEntry.imageId],
    references: [imagesEntry.id],
  }),
  tag: op.one(tagEntry, {
    fields: [imagesToTagsEntry.tagId],
    references: [tagEntry.id],
  }),
}))


export function lower(col: AnySQLiteColumn): any {
  return sql`lower(${col})`;
}

export function andLeast(and1: any, and2: any): any {
  if (and1 && !and2) {
    return and1;
  } else if (!and1 && and2) {
    return and2;
  } else {
    return and(and1, and2);
  }
}

export function minMax(value: MinMax | undefined, col: AnySQLiteColumn): any {
  if (!value || !value.length) return undefined;

  const isMin = value[0] !== null && value[0] !== undefined;
  const isMax = value[1] !== null && value[1] !== undefined;

  return isMin && isMax
    ? between(col, value[0], value[1])
    : isMin
      ? gte(col, value[0])
      : isMax
        ? lte(col, value[1])
        : undefined;
}
