import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const imagesEntry = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').unique().notNull(),
  seed: text('seed'),
  prompt: text('prompt'),
  negativePrompt: text('negative_prompt'),
  sampler: text('sampler'),
  cfg: integer('cfg'),
  steps: integer('steps'),
  width: integer('width'),
  height: integer('height'),
  modelHash: text('model_hash'),
  modelName: text('model_name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
export type ImagePartialEntry = typeof imagesEntry.$inferSelect;
export type ImagePartialEntryInsert = typeof imagesEntry.$inferInsert;


export const statEntry = sqliteTable('stats', {
  id: integer('id').primaryKey().references(() => imagesEntry.id, { onDelete: 'cascade' }),
  favorite: integer('favorite', { mode: 'boolean' }).default(false),
  nsfw: integer('nsfw', { mode: 'boolean'}).default(false)
})
export type StatsEntry = typeof statEntry.$inferSelect;
export type StatsEntryInsert = typeof statEntry.$inferInsert;

export type ImageEntry = ImagePartialEntry & StatsEntry;
