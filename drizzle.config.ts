import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './apps/stable-gallery/src/app/db/schema.ts',
  out: './apps/stable-gallery/src/app/db/migrations',
  dialect: 'sqlite',
})
