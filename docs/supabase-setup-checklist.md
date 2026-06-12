# Supabase Setup Checklist

Status: environment setup only  
Research backend status: not ready for formal research data collection

## Task 11 Dry-run Status

Task 11 enables only `POST /api/login` dry-run validation when `RESEARCH_BACKEND_ENABLED=dry_run` is set server-side.

- Valid dry-run participant codes may create a `game_sessions` row.
- The browser receives only a limited research session object.
- `POST /api/logs-batch` remains disconnected.
- Formal research data collection remains not ready.

## Purpose

This checklist prepares the Supabase environment for the Self-Strengthening Movement research version without enabling live research data collection. It supports the participant-code login model and future process-log submission through Vercel API routes.

## Server-Only Secret Handling

- Store `SUPABASE_SECRET_KEY` only in `.env.local` or Vercel environment variables.
- Do not put real Supabase keys in source control.
- Do not expose Supabase keys through `VITE_SUPABASE_*`.
- Do not create a browser Supabase client for research data writes.
- Do not log the full secret key. If a key fingerprint is ever needed, log only a safe hash or a short non-sensitive label.

## Vercel Environment Variables

Configure these variables in Vercel for Development, Preview, and Production:

| Variable | Development | Preview | Production | Notes |
|---|---:|---:|---:|---|
| `SUPABASE_URL` | yes | yes | yes | Project URL. |
| `SUPABASE_SECRET_KEY` | yes | yes | yes | Server-only. |
| `SUPABASE_SCHEMA` | yes | yes | yes | Start with `public`. |
| `RESEARCH_BACKEND_ENABLED` | `false` or `dry_run` | `dry_run` | `false` until research freeze | Do not enable production writes yet. |
| `RESEARCH_COHORT` | yes | yes | yes | `lkkc-may-june-2026`. |
| `APP_VERSION` | yes | yes | yes | Match app versioning process. |

## Supabase Project Setup

- Create a dedicated Supabase project for this study.
- Suggested project name: `yangwu-research-lkkc-2026`.
- Record the selected Supabase region in a private researcher setup note.
- Do not store the name-to-code matching list in Supabase.

## Migration Order

1. Apply `docs/supabase-schema-v1.sql`.
2. Review grants and default privileges.
3. Add Row Level Security (RLS) policies.
4. Insert dry-run seed data from `docs/supabase-seed-dryrun.sql`.
5. Test `POST /api/login` with dry-run participants.
6. Test excluded participant behaviour.
7. Test log submission only after login dry-run is stable.

## Row Level Security And Grants

- RLS is already enabled in `docs/supabase-schema-v1.sql`.
- Grants and RLS policies must be reviewed together.
- Do not grant broad `anon` access to research tables.
- Keep student browser access behind Vercel API routes.
- `participants` should be read by server route using `participant_code` and `session_code`.
- `game_sessions` should be inserted by server route after valid login.
- `event_logs` should be inserted later by server route after payload filtering.
- `research_scores`, `derived_indicators`, and `export_batches` are researcher/export paths, not student-browser paths.

## Dry-Run Data

- Use only pseudonymous participant codes.
- Use `LKKC-2026-DRYRUN` as the dry-run session code.
- Do not include student names, emails, phone numbers, school account IDs, or name-to-code linkage.
- Keep any real name-to-code matching list outside Supabase.

## Local Development

- Continue using Vite for frontend UI QA.
- Use Vercel dev or separate API route tests for API integration QA.
- Without `.env.local`, `/api/login` should continue to report backend-not-connected behaviour.
- No real student research data should be submitted from localhost.

## Before Formal Research Data Collection

The environment remains not ready for formal research data collection until all of the following are complete:

- Supabase project created for this study.
- Vercel environment variables configured without exposing secrets to browser code.
- Schema migration applied.
- Grants and RLS policies reviewed.
- Dry-run participants inserted.
- Valid dry-run login creates one `game_sessions` row.
- Excluded dry-run participant returns `invalid_or_excluded_participant`.
- Missing code returns `missing_codes`.
- Frontend stores only the limited research session object.
- Export workflow documented.
- Deletion / withdrawal workflow documented.

## References

- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase securing your API: https://supabase.com/docs/guides/api/securing-your-api
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
