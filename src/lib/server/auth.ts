import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from './db/schema';

/**
 * Creates a better-auth instance with the provided database
 * @param database - Drizzle database instance (postgres-js or PGlite)
 */
export function createAuth(
  database: PostgresJsDatabase<typeof schema> | PgliteDatabase<typeof schema>,
) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: 'pg',
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true, // Automatically sign in after signup
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
    },
    secret: process.env.BETTER_AUTH_SECRET || 'default-secret-for-development-only',
    trustedOrigins: ['http://localhost:5173', 'http://localhost:4173'],
  });
}

/**
 * Default auth instance using production database
 * Lazy-loaded to avoid importing $env/dynamic/private in test environments
 */
let _auth: ReturnType<typeof createAuth> | undefined;

export const auth = new Proxy({} as ReturnType<typeof createAuth>, {
  get(_target, prop) {
    if (!_auth) {
      // Lazy-load the production database
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { db } = require('./db');
      _auth = createAuth(db);
    }
    return _auth[prop as keyof typeof _auth];
  },
});

/**
 * Type exports for better-auth session and user
 */
export type Session = ReturnType<typeof createAuth>['$Infer']['Session']['session'];
export type User = ReturnType<typeof createAuth>['$Infer']['Session']['user'];
