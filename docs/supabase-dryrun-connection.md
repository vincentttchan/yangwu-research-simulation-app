# Supabase Dry-run Connection

Status: dry-run login connection prepared  
Formal research collection status: not ready for formal research data collection

## What Task 11 Enables

Task 11 enables only a controlled dry-run login path:

- `POST /api/login` can validate pseudonymous dry-run participant codes when the backend is explicitly set to `dry_run`.
- Valid dry-run participants create a `game_sessions` row.
- The browser receives only a limited session object.

Task 11 does not enable formal research data collection and does not submit gameplay logs to Supabase.

## Required Server-side Environment

Set these only in `.env.local` for local API testing or in Vercel environment variables:

| Variable | Dry-run value |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Server-only Supabase secret key |
| `SUPABASE_SCHEMA` | `public` |
| `RESEARCH_BACKEND_ENABLED` | `dry_run` |
| `RESEARCH_COHORT` | `lkkc-may-june-2026` |
| `APP_VERSION` | current app version |

Do not add these real values to source control.

## Dry-run Database Preparation

1. Apply `docs/supabase-schema-v1.sql`.
2. Insert `docs/supabase-seed-dryrun.sql`.
3. Confirm the dry-run participants exist:
   - `YW-001`, included, scaffolded;
   - `YW-002`, included, standard;
   - `YW-999`, excluded test case.
4. Keep the real name-to-code matching list outside Supabase.

## Expected Login Results

| Case | Expected result |
|---|---|
| Backend disabled | `501 supabase_not_connected` |
| Missing codes | `400 missing_codes` |
| `YW-001` + `LKKC-2026-DRYRUN` | `200` with limited session object |
| `YW-002` + `LKKC-2026-DRYRUN` | `200` with limited session object |
| `YW-999` + `LKKC-2026-DRYRUN` | `403 invalid_or_excluded_participant` |
| Wrong code or wrong session code | `403 invalid_or_excluded_participant` |

## Still Disabled

- `POST /api/logs-batch` still returns `supabase_not_connected`.
- No real student research data should be submitted.
- No student name, school account credential, direct contact detail, GPS, camera, microphone, screen recording, or name-to-code linkage should be collected by the game.
- No frontend Supabase client should be created.

## Verification

Run:

```bash
npm run check:supabase-dryrun
npm run check:backend-boundary
npm run check:supabase-env
npm run build
```

For full release QA, also run the full existing check suite.
