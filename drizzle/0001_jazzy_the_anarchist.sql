CREATE TYPE "public"."log_level" AS ENUM('debug', 'info', 'warn', 'error', 'fatal');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"level" "log_level" NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"time_unix_nano" text,
	"observed_time_unix_nano" text,
	"severity_number" integer,
	"severity_text" text,
	"body" jsonb,
	"dropped_attributes_count" integer,
	"flags" integer,
	"trace_id" text,
	"span_id" text,
	"resource_attributes" jsonb,
	"resource_dropped_attributes_count" integer,
	"resource_schema_url" text,
	"scope_name" text,
	"scope_version" text,
	"scope_attributes" jsonb,
	"scope_dropped_attributes_count" integer,
	"scope_schema_url" text,
	"source_file" text,
	"line_number" integer,
	"request_id" text,
	"user_id" text,
	"ip_address" text,
	"timestamp" timestamp with time zone DEFAULT now(),
	"search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "log"."message"), 'A') ||
        setweight(to_tsvector('english', COALESCE("log"."body"::text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE("log"."metadata"::text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE("log"."resource_attributes"::text, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE("log"."scope_attributes"::text, '')), 'C')) STORED
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log" ADD CONSTRAINT "log_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_log_project_id" ON "log" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_log_timestamp" ON "log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_log_level" ON "log" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_log_project_timestamp" ON "log" USING btree ("project_id","timestamp");--> statement-breakpoint
CREATE INDEX "idx_log_search" ON "log" USING btree ("search");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");