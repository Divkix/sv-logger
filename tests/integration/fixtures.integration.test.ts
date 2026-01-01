import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as schema from '../../src/lib/server/db/schema';
import { setupTestDatabase } from '../../src/lib/server/db/test-db';
import {
  createUserFactory,
  seedTestData,
  seedUser,
  seedUsers,
  seedUsersWithAges,
} from '../fixtures/db';

describe('Database Fixtures - Integration Tests', () => {
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

  describe('createUserFactory', () => {
    it('should create a user object with default values', () => {
      const user = createUserFactory();
      expect(user).toEqual({ age: 25 });
    });

    it('should allow overriding default values', () => {
      const user = createUserFactory({ age: 30 });
      expect(user).toEqual({ age: 30 });
    });
  });

  describe('seedUser', () => {
    it('should seed a single user with default values', async () => {
      const user = await seedUser(db);

      expect(user).toMatchObject({
        id: expect.any(Number),
        age: 25,
      });

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(1);
    });

    it('should seed a single user with custom values', async () => {
      const user = await seedUser(db, { age: 35 });

      expect(user.age).toBe(35);
    });
  });

  describe('seedUsers', () => {
    it('should seed multiple users with default count', async () => {
      const users = await seedUsers(db);

      expect(users).toHaveLength(3);
      expect(users[0].age).toBe(20);
      expect(users[1].age).toBe(25);
      expect(users[2].age).toBe(30);
    });

    it('should seed custom number of users', async () => {
      const users = await seedUsers(db, 5);

      expect(users).toHaveLength(5);
    });

    it('should apply overrides to all users', async () => {
      const users = await seedUsers(db, 2, { age: 100 });

      expect(users).toHaveLength(2);
      expect(users[0].age).toBe(100);
      expect(users[1].age).toBe(100);
    });
  });

  describe('seedUsersWithAges', () => {
    it('should seed users with specific ages', async () => {
      const ages = [18, 25, 30, 45, 60];
      const users = await seedUsersWithAges(db, ages);

      expect(users).toHaveLength(5);
      expect(users.map((u) => u.age)).toEqual(ages);
    });

    it('should work with empty array', async () => {
      const users = await seedUsersWithAges(db, []);

      expect(users).toHaveLength(0);
    });
  });

  describe('seedTestData', () => {
    it('should seed users when provided', async () => {
      await seedTestData(db, {
        users: [{ age: 20 }, { age: 30 }, { age: 40 }],
      });

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(3);
      expect(users.map((u) => u.age)).toEqual([20, 30, 40]);
    });

    it('should handle empty data object', async () => {
      await seedTestData(db, {});

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(0);
    });

    it('should handle undefined users array', async () => {
      await seedTestData(db, { users: undefined });

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(0);
    });
  });

  describe('Fixtures in Real Test Scenarios', () => {
    it('should support test scenario with pre-seeded data', async () => {
      // Seed test data
      const seededUsers = await seedUsersWithAges(db, [20, 25, 30]);

      // Test query
      const allUsers = await db.select().from(schema.user);
      expect(allUsers).toHaveLength(3);

      // Verify IDs are assigned
      expect(seededUsers.every((u) => typeof u.id === 'number')).toBe(true);
    });

    it('should support multiple seeding operations', async () => {
      await seedUser(db, { age: 20 });
      await seedUser(db, { age: 30 });
      await seedUsers(db, 2, { age: 40 });

      const users = await db.select().from(schema.user);
      expect(users).toHaveLength(4);
    });
  });
});
