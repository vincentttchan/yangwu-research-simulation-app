# Task 11 Supabase Dry-run Connection Design Spec

Date: 2026-06-12  
Workstream: research/logger  
Status: implemented dry-run connection boundary

## Purpose

Task 11 moves the research backend from environment setup to a controlled Supabase dry-run connection. It does not enable formal research data collection.

The first live-facing behaviour is limited to `POST /api/login`:

- disabled or missing config returns `supabase_not_connected`;
- `RESEARCH_BACKEND_ENABLED=dry_run` allows the API route to validate pseudonymous participant codes against Supabase;
- valid dry-run participants create one `game_sessions` row;
- excluded, withdrawn, missing, or mismatched participants return `invalid_or_excluded_participant`;
- the response returns only a limited research session object.

`POST /api/logs-batch` remains disconnected until a later approved logging sprint.

## Server-only Supabase Boundary

Supabase is accessed only from Vercel API routes. Browser code under `src/` must not import `@supabase/supabase-js`, call `createClient`, or read `SUPABASE_SECRET_KEY`.

The server helper is:

- `api/_supabase.js`

It creates a Supabase client only when:

- `RESEARCH_BACKEND_ENABLED=dry_run`;
- `SUPABASE_URL` is present server-side;
- `SUPABASE_SECRET_KEY` is present server-side.

The client disables browser-style session persistence.

## Login Flow

Input:

- `participant_code`;
- `session_code`;
- `app_version`;
- `research_cohort`;
- `content_map_version`;
- `device`.

Participant lookup:

- table: `participants`;
- match by `participant_code` and `session_code`;
- select only `participant_code`, `session_code`, `class_id`, `condition`, and `consent_status`.

Session insert:

- table: `game_sessions`;
- insert `participant_code`, `app_version`, `research_cohort`, `content_map_version`, safe device fields, and `completion_status='started'`.

Returned session object:

- `session_id`;
- `participant_code`;
- `class_id`;
- `condition`;
- `app_version`;
- `research_cohort`;
- `content_map_version`.

The API must not return participant notes, session code, consent notes, Supabase error details, or name-to-code linkage.

## Verification

Task 11 adds:

- `tests/supabase-dryrun-login-check.mjs`;
- `check:supabase-dryrun`;
- stronger backend boundary checks;
- stronger Supabase environment checks;
- API syntax checks for `api/_supabase.js`, `api/login.js`, and `api/logs-batch.js`.

Required gate:

```bash
npm run check:syntax
npm run check:backend-boundary
npm run check:supabase-env
npm run check:supabase-dryrun
```

Full project verification should also include the existing stability, research map, instrumentation, asset, login UI, and build checks.

## External Documentation Basis

- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase server-side client guidance: https://supabase.com/docs/guides/auth/server-side/creating-a-client
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
