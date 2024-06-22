import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  path: text('path').notNull(),
  seed: text('seed').notNull(),
  prompt: text('prompt'),
  negativePrompt: text('neegative_prompt'),
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
