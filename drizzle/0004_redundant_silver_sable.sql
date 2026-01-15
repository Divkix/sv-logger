-- Migration: Add owner_id to project table
-- Requires at least one user to exist if projects exist

-- Step 0: Pre-flight check - fail fast with clear error
DO $$
BEGIN
  -- Check if projects exist but no users exist
  IF EXISTS (SELECT 1 FROM "project" LIMIT 1)
     AND NOT EXISTS (SELECT 1 FROM "user" LIMIT 1) THEN
    RAISE EXCEPTION
      'Migration blocked: Projects exist but no users found. Run "bun run db:seed" to create an admin user first, then retry.';
  END IF;
END $$;--> statement-breakpoint

-- Step 1: Add owner_id column as nullable (idempotent - skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE "project" ADD COLUMN "owner_id" text;
  END IF;
END $$;--> statement-breakpoint

-- Step 2: Backfill existing projects with the first user
UPDATE "project" SET "owner_id" = (
  SELECT "id" FROM "user" ORDER BY "created_at" ASC LIMIT 1
) WHERE "owner_id" IS NULL;--> statement-breakpoint

-- Step 3: Make NOT NULL (idempotent - skip if already NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project'
      AND column_name = 'owner_id'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "project" ALTER COLUMN "owner_id" SET NOT NULL;
  END IF;
END $$;--> statement-breakpoint

-- Step 4: Add foreign key (idempotent - skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'project_owner_id_user_id_fk'
  ) THEN
    ALTER TABLE "project" ADD CONSTRAINT "project_owner_id_user_id_fk"
      FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id")
      ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint

-- Step 5: Create index (idempotent - skip if exists)
CREATE INDEX IF NOT EXISTS "idx_project_owner_id" ON "project" USING btree ("owner_id");
