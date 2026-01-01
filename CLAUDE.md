# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

sv-logger is a self-hosted logging platform with real-time log streaming, full-text search, and per-project API key authentication. See `dev-docs/PRD.md` for complete specifications.

## Commands

```bash
# Development
bun run dev              # Start dev server
bun run build            # Production build
bun run preview          # Preview production build

# Code Quality
bun run check            # TypeScript + Svelte checks
bun run lint             # Biome linting
bun run lint:fix         # Auto-fix lint issues
bun run knip             # Find unused exports/dependencies

# Database (requires DATABASE_URL)
bun run db:start         # Start PostgreSQL via Docker Compose
bun run db:push          # Push schema to database
bun run db:generate      # Generate migration files
bun run db:migrate       # Run migrations
bun run db:studio        # Open Drizzle Studio
```

## Tech Stack

- **Framework:** SvelteKit with adapter-node
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** better-auth (planned)
- **UI:** shadcn-svelte + Tailwind CSS v4
- **Real-time:** Server-Sent Events via sveltekit-sse (planned)
- **Runtime:** Bun

## Architecture

### Database Layer (`src/lib/server/db/`)
- `schema.ts` - Drizzle table definitions (project, log tables with tsvector search)
- `index.ts` - Database client initialization using postgres.js

### API Structure (planned)
- `POST /api/v1/logs` - Single log ingestion (API key auth)
- `POST /api/v1/logs/batch` - Batch ingestion (max 100)
- `/api/projects/*` - Project CRUD (session auth)
- `/api/projects/[id]/logs/stream` - SSE endpoint for real-time logs

### Real-time Design
Uses in-memory event bus (not pg_notify) to avoid database polling at high volume. Log ingestion writes to DB AND emits to event bus; SSE endpoints subscribe to the bus.

## Code Conventions

- Use spaces, not tabs (2-space indent)
- Conventional commits with details
- Use bun instead of npm
- Svelte 5 runes syntax (`$props()`, `$state()`, `$effect()`)
- Single quotes, trailing commas, semicolons (Biome config)

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ADMIN_PASSWORD=<admin-password>
BETTER_AUTH_SECRET=<32-char-secret>
```
