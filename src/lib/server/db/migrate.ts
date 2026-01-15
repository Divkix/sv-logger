import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index';

let migrated = false;

/**
 * Run database migrations on startup.
 * Idempotent - only runs once per process, and Drizzle tracks applied migrations.
 */
export async function runMigrations(): Promise<void> {
  if (migrated) return;

  try {
    console.log('[db] Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('[db] Migrations complete');
    migrated = true;
  } catch (error) {
    console.error('[db] Migration failed:', error);
    throw error;
  }
}
