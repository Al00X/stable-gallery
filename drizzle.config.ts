import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './apps/stable-gallery/src/app/core/db/schema.ts',
  out: './apps/stable-gallery/src/app/core/db/migrations',
  dialect: 'sqlite',
});
