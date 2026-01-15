import type { Config } from 'drizzle-kit'

// export default {
//   schema: './drizzle/schema.js',
//   out: './drizzle',
//   dialect: 'mysql',
//   dbCredentials: {
//     host: process.env.DB_HOST!,
//     port: parseInt(process.env.DB_PORT!),
//     user: process.env.DB_USER!,
//     password: process.env.DB_PASSWORD!,
//     database: process.env.DB_NAME!,
//   },
// } satisfies Config

import { defineConfig } from 'drizzle-kit'
// via connection params
export default defineConfig({
  schema: './drizzle/schema.js',
  out: './drizzle',
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: 3306,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    // can be: string | SslOptions (ssl options from mysql2 package)
  }
});
