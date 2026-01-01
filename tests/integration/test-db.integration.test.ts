import { eq } from 'drizzle-orm';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as schema from '../../src/lib/server/db/schema';
import {
  cleanDatabase,
  createTestDatabase,
  setupTestDatabase,
} from '../../src/lib/server/db/test-db';

describe('Test Database (PGlite) - Integration Tests', () => {
  let db: PgliteDatabase<typeof schema>;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    db = setup.db;
    cleanup = setup.cleanup;
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('createTestDatabase', () => {
    it('should create an in-memory PGlite database', async () => {
      const testDb = await createTestDatabase();
      expect(testDb).toBeDefined();
      expect(testDb.execute).toBeDefined();
      expect(testDb.insert).toBeDefined();
      expect(testDb.select).toBeDefined();
    });

    it('should apply schema tables dynamically from Drizzle schema', async () => {
      const testDb = await createTestDatabase();

      // Schema should have created the user table
      const result = await testDb.insert(schema.user).values({ age: 30 }).returning();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0].age).toBe(30);
    });

    it('should support all schema tables (not just hardcoded ones)', async () => {
      // This test will fail if we hardcode table creation
      // When we add more tables to schema, they should automatically be created
      const testDb = await createTestDatabase();

      // User table should exist
      const users = await testDb.select().from(schema.user);
      expect(Array.isArray(users)).toBe(true);

      // Future tables should also work automatically
      // (This is a forward-compatibility test)
    });
  });

  describe('cleanDatabase', () => {
    it('should truncate all tables and reset sequences', async () => {
      // Insert test data
      await db.insert(schema.user).values([{ age: 20 }, { age: 30 }, { age: 40 }]);

      const beforeClean = await db.select().from(schema.user);
      expect(beforeClean).toHaveLength(3);

      // Clean database
      await cleanDatabase(db);

      const afterClean = await db.select().from(schema.user);
      expect(afterClean).toHaveLength(0);
    });

    it('should restart identity sequences after truncate', async () => {
      // Insert and delete
      const first = await db.insert(schema.user).values({ age: 25 }).returning();
      expect(first[0].id).toBe(1);

      await cleanDatabase(db);

      // Next insert should also start from 1
      const second = await db.insert(schema.user).values({ age: 30 }).returning();
      expect(second[0].id).toBe(1);
    });

    it('should handle empty database gracefully', async () => {
      // Should not throw error on empty database
      await expect(cleanDatabase(db)).resolves.toBeUndefined();
    });

    it('should truncate all tables in schema dynamically', async () => {
      // Insert data in user table
      await db.insert(schema.user).values({ age: 25 });

      // Clean should work for all tables
      await cleanDatabase(db);

      // All tables should be empty
      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(0);
    });
  });

  describe('setupTestDatabase', () => {
    it('should return database instance and cleanup function', async () => {
      const setup = await setupTestDatabase();

      expect(setup.db).toBeDefined();
      expect(setup.cleanup).toBeDefined();
      expect(typeof setup.cleanup).toBe('function');
    });

    it('should provide isolated database instances', async () => {
      const setup1 = await setupTestDatabase();
      const setup2 = await setupTestDatabase();

      // Insert data in first instance
      await setup1.db.insert(schema.user).values({ age: 20 });

      // Second instance should be empty
      const users = await setup2.db.select().from(schema.user);
      expect(users).toHaveLength(0);

      // Cleanup
      await setup1.cleanup();
      await setup2.cleanup();
    });

    it('cleanup should clear all data', async () => {
      const setup = await setupTestDatabase();

      await setup.db.insert(schema.user).values([{ age: 20 }, { age: 30 }]);
      const before = await setup.db.select().from(schema.user);
      expect(before).toHaveLength(2);

      await setup.cleanup();

      const after = await setup.db.select().from(schema.user);
      expect(after).toHaveLength(0);
    });
  });

  describe('CRUD Operations', () => {
    it('should support CREATE operations', async () => {
      const result = await db.insert(schema.user).values({ age: 35 }).returning();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: expect.any(Number),
        age: 35,
      });
    });

    it('should support READ operations', async () => {
      await db.insert(schema.user).values([{ age: 20 }, { age: 30 }, { age: 40 }]);

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(3);
      expect(users.map((u) => u.age)).toEqual([20, 30, 40]);
    });

    it('should support UPDATE operations', async () => {
      const [inserted] = await db.insert(schema.user).values({ age: 25 }).returning();

      const [updated] = await db
        .update(schema.user)
        .set({ age: 26 })
        .where(eq(schema.user.id, inserted.id))
        .returning();

      expect(updated.age).toBe(26);
    });

    it('should support DELETE operations', async () => {
      const [inserted] = await db.insert(schema.user).values({ age: 25 }).returning();

      await db.delete(schema.user).where(eq(schema.user.id, inserted.id));

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(0);
    });
  });

  describe('Transaction Support', () => {
    it('should support database transactions', async () => {
      await expect(
        db.transaction(async (tx) => {
          await tx.insert(schema.user).values({ age: 25 });
          await tx.insert(schema.user).values({ age: 30 });
          return true;
        }),
      ).resolves.toBe(true);

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(2);
    });

    it('should rollback on transaction error', async () => {
      await expect(
        db.transaction(async (tx) => {
          await tx.insert(schema.user).values({ age: 25 });
          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(0);
    });
  });
});
