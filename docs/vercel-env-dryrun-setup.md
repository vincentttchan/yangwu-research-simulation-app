# Vercel Environment Setup For Supabase Dry-run

Status: dry-run setup guide  
Formal research collection status: not ready for formal research data collection

## Purpose

This guide prepares the Vercel environment for the Self-Strengthening Movement simulation dry-run login test. It is for `POST /api/login` only.

Task 12 does not enable formal research data collection and does not enable `POST /api/logs-batch`.

## Environment Variable Matrix

Set these variables in Vercel Project Settings or through Vercel CLI.

| Variable | Development | Preview | Production | Notes |
|---|---:|---:|---:|---|
| `SUPABASE_URL` | yes | yes | optional | Project URL. |
| `SUPABASE_SECRET_KEY` | yes | yes | optional | Server-only secret. Mark sensitive where available. |
| `SUPABASE_SCHEMA` | `public` | `public` | `public` | Current schema draft. |
| `RESEARCH_BACKEND_ENABLED` | `dry_run` | `dry_run` | `false` | Production should stay disabled until research freeze approval. |
| `RESEARCH_COHORT` | `lkkc-may-june-2026` | `lkkc-may-june-2026` | `lkkc-may-june-2026` | Cohort marker. |
| `APP_VERSION` | `dev-v0.1` | `dev-v0.1` | current version | Match app versioning process. |

Do not add real values to `.env.example` or commit them to git.

## Vercel Dashboard Setup

1. Open the Vercel project.
2. Go to Settings -> Environment Variables.
3. Add the variables above.
4. Apply dry-run values to Development and Preview first.
5. Keep Production `RESEARCH_BACKEND_ENABLED=false` until the research freeze version is approved.
6. Redeploy Preview after changing environment variables.

Vercel environment variable changes apply to new deployments, not previous deployments.

## Vercel CLI Option

The Vercel CLI can list, add, and pull environment variables.

Useful commands:

```bash
vercel env ls
vercel env add SUPABASE_URL preview
vercel env add SUPABASE_SECRET_KEY preview
vercel env add RESEARCH_BACKEND_ENABLED preview
vercel pull --environment=preview
```

Use the CLI only after the local folder is linked to the correct Vercel project.

## Supabase Preparation

In Supabase SQL editor:

1. Apply `docs/supabase-schema-v1.sql`.
2. Apply `docs/supabase-seed-dryrun.sql`.
3. Confirm these participant rows:
   - `YW-001` + `LKKC-2026-DRYRUN`, included, scaffolded;
   - `YW-002` + `LKKC-2026-DRYRUN`, included, standard;
   - `YW-999` + `LKKC-2026-DRYRUN`, excluded.

Do not store the name-to-code matching list in Supabase.

## Live Dry-run QA

After deploying a Preview URL, run:

```bash
DRYRUN_QA_BASE_URL="https://your-preview-url.vercel.app" npm run check:live-dryrun
```

Expected results:

| Case | Expected |
|---|---|
| Missing codes | `400 missing_codes` |
| `YW-001` + `LKKC-2026-DRYRUN` | `200` with limited session object |
| `YW-999` + `LKKC-2026-DRYRUN` | `403 invalid_or_excluded_participant` |
| Wrong session code | `403 invalid_or_excluded_participant` |
| `POST /api/logs-batch` | `501 supabase_not_connected` |

To force CI or local QA to fail when no URL is supplied:

```bash
REQUIRE_LIVE_DRYRUN_QA=true npm run check:live-dryrun
```

## Safety Stop Conditions

Stop and do not proceed to student testing if:

- the API returns participant `notes`;
- the API returns `session_code`;
- `POST /api/logs-batch` accepts logs;
- Production has `RESEARCH_BACKEND_ENABLED=dry_run` before formal approval;
- frontend files import `@supabase/supabase-js`;
- real student identifiers appear in Supabase.

## References

- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel CLI environment variables: https://vercel.com/docs/cli/env
- Vercel pull: https://vercel.com/docs/cli/pull
