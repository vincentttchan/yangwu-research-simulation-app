# Task 20.2 Pilot APP_VERSION Freeze / Final Rehearsal Prep

Status: pilot version freeze prepared and live row verification passed  
Formal research data collection status: not approved until final rehearsal and sign-off are complete

## Purpose

Task 20.2 freezes the app version marker for the LKKC pilot cycle so that Supabase rows, researcher CSV exports, dry-run notes, and later analysis can be traced to the same build.

This task does not approve real student data collection. It prepares the versioning layer needed before the final rehearsal.

## Frozen Pilot Markers

| Marker | Value |
|---|---|
| `APP_VERSION` | `lkkc-pilot-v1.0` |
| `RESEARCH_COHORT` | `lkkc-may-june-2026` |
| `content_map_version` | `content-freeze-lite-v0.1` |

## Implementation Notes

The following active code paths now use `lkkc-pilot-v1.0`:

- `src/research/version.js`
- `src/research/content-map.js`
- `api/login.js`
- `api/logs-batch.js`
- `.env.example`
- active QA tests and CSV fixtures
- research-facing baseline docs

Historical planning documents may still mention `dev-v0.1` because they describe earlier dry-run stages. They should not be treated as the current pilot source of truth.

## Required Vercel Update

Before the final rehearsal, update Vercel environment variables for the intended deployment environment:

```text
APP_VERSION=lkkc-pilot-v1.0
RESEARCH_COHORT=lkkc-may-june-2026
RESEARCH_BACKEND_ENABLED=dry_run
```

Keep `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `SUPABASE_SCHEMA` server-side only.

## Final Rehearsal Checklist

After redeployment:

- [x] Open `https://yangwu-research-simulation-app.vercel.app/?mode=research`.
- [x] Login with `YW-001` and `LKKC-2026-DRYRUN`.
- [ ] Generate at least one city entry, evidence task, event opening, and decision event.
- [x] Confirm a new `game_sessions` row has `app_version = 'lkkc-pilot-v1.0'`.
- [x] Confirm linked `event_logs` rows have `app_version = 'lkkc-pilot-v1.0'`.
- [x] Confirm `research_cohort = 'lkkc-may-june-2026'`.
- [x] Confirm `content_map_version = 'content-freeze-lite-v0.1'`.
- [ ] Run privacy QA and confirm zero rows.
- [ ] Export the six researcher CSVs again.
- [ ] Run `npm run check:research-csv-export -- /path/to/export-folder`.
- [ ] Update the Task 20.1 sign-off with the final rehearsal result.

## Task 20.3 Live Row Verification

Completed on 2026-06-14 after Vercel redeployment.

Evidence:

- `npm run check:live-dryrun` passed against `https://yangwu-research-simulation-app.vercel.app`.
- Production `/api/login` returned a valid `YW-001` session with:
  - `app_version = 'lkkc-pilot-v1.0'`
  - `research_cohort = 'lkkc-may-june-2026'`
  - `content_map_version = 'content-freeze-lite-v0.1'`
- Researcher confirmed latest Supabase `game_sessions` and `event_logs` rows show `app_version = 'lkkc-pilot-v1.0'`.

## Remaining Before Real Student Use

Even after Task 20.2, real student use still requires:

- target iPad and phone QA;
- school network QA;
- real pseudonymous participant/session codes;
- consent and classroom administration confirmation;
- teacher/researcher classroom runbook;
- final CSV export QA from the latest rehearsal package.
