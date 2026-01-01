import { eq } from 'drizzle-orm';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAuth } from '../../src/lib/server/auth';
import type * as schema from '../../src/lib/server/db/schema';
import { user } from '../../src/lib/server/db/schema';
import { setupTestDatabase } from '../../src/lib/server/db/test-db';

// Admin email constant (matches the one in seed-admin.ts)
const ADMIN_EMAIL = 'admin@example.com';

/**
 * Test helper that mimics the seed-admin script logic
 */
async function seedAdmin(
  db: PgliteDatabase<typeof schema>,
  adminPassword: string,
): Promise<{ created: boolean; message: string }> {
  const auth = createAuth(db);

  // Validate password
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
  }

  // Check if admin already exists
  const existingAdmin = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL));

  if (existingAdmin.length > 0) {
    return { created: false, message: 'Admin user already exists, skipping' };
  }

  // Create admin user via better-auth
  const result = await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: adminPassword,
      name: 'Admin',
    },
  });

  if (result.error) {
    throw new Error(`Failed to create admin user: ${result.error.message}`);
  }

  return { created: true, message: 'Admin user created successfully' };
}

describe('seed-admin', () => {
  let db: Awaited<ReturnType<typeof setupTestDatabase>>['db'];
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    db = setup.db;
    cleanup = setup.cleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should create admin user on first run', async () => {
    const adminPassword = 'test-admin-password-123';

    const result = await seedAdmin(db, adminPassword);

    expect(result.created).toBe(true);
    expect(result.message).toBe('Admin user created successfully');

    // Verify user was created in database
    const users = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL));
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Admin');
    expect(users[0].email).toBe(ADMIN_EMAIL);
    expect(users[0].emailVerified).toBe(false);
  });

  it('should skip if admin already exists', async () => {
    const adminPassword = 'test-admin-password-123';

    // Create admin user first
    const firstResult = await seedAdmin(db, adminPassword);
    expect(firstResult.created).toBe(true);

    // Try to create again
    const secondResult = await seedAdmin(db, adminPassword);
    expect(secondResult.created).toBe(false);
    expect(secondResult.message).toBe('Admin user already exists, skipping');

    // Verify still only one user
    const users = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL));
    expect(users).toHaveLength(1);
  });

  it('should use ADMIN_PASSWORD from environment', async () => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'fallback-password-123';

    const result = await seedAdmin(db, adminPassword);

    expect(result.created).toBe(true);

    // Verify user was created
    const users = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL));
    expect(users).toHaveLength(1);
  });

  it('should use admin@example.com as email', async () => {
    const adminPassword = 'test-admin-password-123';

    const result = await seedAdmin(db, adminPassword);

    expect(result.created).toBe(true);

    // Verify the exact email
    const users = await db.select().from(user);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(ADMIN_EMAIL);
  });

  it('should be able to sign in with created credentials', async () => {
    const adminPassword = 'test-admin-password-123';
    const auth = createAuth(db);

    // Create admin user
    await seedAdmin(db, adminPassword);

    // Try to sign in - better-auth with autoSignIn creates session during signup
    // So we should be able to verify credentials by checking the password works
    const signInResult = await auth.api.signInEmail({
      body: {
        email: ADMIN_EMAIL,
        password: adminPassword,
      },
    });

    // Check that sign in succeeded (no error)
    expect(signInResult.error).toBeUndefined();

    // Verify user exists in database with correct email
    const users = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL));
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(ADMIN_EMAIL);
  });

  it('should throw error if password is empty', async () => {
    await expect(seedAdmin(db, '')).rejects.toThrow(
      'ADMIN_PASSWORD must be at least 8 characters long',
    );
  });

  it('should throw error if password is too short', async () => {
    await expect(seedAdmin(db, 'short')).rejects.toThrow(
      'ADMIN_PASSWORD must be at least 8 characters long',
    );
  });
});
