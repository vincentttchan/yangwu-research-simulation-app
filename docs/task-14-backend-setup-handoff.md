# Task 14 Backend Setup Handoff

Status: blocked on account-side secret entry  
Formal research collection status: not ready for formal research data collection

## Current Vercel Project

The Vercel connector can read the project, but cannot write environment variables.

| Field | Value |
|---|---|
| Team | `Vincentchanchyv's projects` |
| Team id | `team_6KoCGrIgAQgujO0mmQIN1b1L` |
| Project | `ziqiang-game` |
| Project id | `prj_1vBLiQics6OzzfHM7QhU9tDeHGOR` |
| Production domain | `ziqiang-game.vercel.app` |
| Latest deployment state | `READY` |

## What Is Already Ready In Code

- `POST /api/login` supports dry-run Supabase login.
- `POST /api/logs-batch` remains disabled.
- `@supabase/supabase-js` is installed for server-side API routes only.
- Frontend code does not import Supabase SDK or read `SUPABASE_SECRET_KEY`.
- `check:live-dryrun` can test a deployed URL once env vars are configured.

## What Still Requires Account-side Action

These actions require the user's Vercel/Supabase dashboard access. Do not paste secret values into chat or commit them to git.

### Supabase

- [ ] Create/open a dedicated Supabase project for the dry-run.
- [ ] Apply `docs/supabase-schema-v1.sql`.
- [ ] Apply `docs/supabase-seed-dryrun.sql`.
- [ ] Copy the project URL into Vercel as `SUPABASE_URL`.
- [ ] Copy the server-side Supabase secret key into Vercel as `SUPABASE_SECRET_KEY`.

### Vercel

In project `ziqiang-game`, set Preview/Development environment variables:

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SECRET_KEY`
- [ ] `SUPABASE_SCHEMA=public`
- [ ] `RESEARCH_BACKEND_ENABLED=dry_run`
- [ ] `RESEARCH_COHORT=lkkc-may-june-2026`
- [ ] `APP_VERSION=dev-v0.1`

Keep Production:

- [ ] `RESEARCH_BACKEND_ENABLED=false`

Redeploy Preview after environment variables are changed.

## Live QA Command

After Preview or Production redeploy:

```bash
DRYRUN_QA_BASE_URL="https://your-preview-url.vercel.app" npm run check:live-dryrun
```

Expected:

- `YW-001` succeeds;
- `YW-999` is rejected;
- wrong session code is rejected;
- `POST /api/logs-batch` remains `supabase_not_connected`.

## Current Blocker

The current Codex session can inspect the Vercel project and deployments, but it cannot safely write Vercel environment variables or create/configure a Supabase project because:

- no Supabase connector is available;
- no local Supabase CLI is installed;
- no local Vercel CLI is installed or linked;
- the Vercel connector available here does not expose an environment-variable write tool;
- real secrets should not be sent through chat.

## Research Boundary

Completing this backend setup only proves dry-run login readiness. It does not mean formal research data collection is ready.

## 2026-06-12 Production Dry-run Note

Production environment variables were added manually in Vercel for dry-run verification:

- `SUPABASE_SCHEMA=public`
- `RESEARCH_BACKEND_ENABLED=dry_run`
- `RESEARCH_COHORT=lkkc-may-june-2026`
- `APP_VERSION=dev-v0.1`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

The next Production deployment should be checked with the live dry-run QA command before any classroom use.
