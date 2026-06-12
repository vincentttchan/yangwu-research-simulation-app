# Task 13 First Real Preview Dry-run Guide

Status: operational checklist  
Formal research collection status: not ready for formal research data collection

## Purpose

Task 13 is the first real Preview dry-run using Supabase and Vercel. It verifies that the deployed research login can validate pseudonymous dry-run participant codes and create dry-run `game_sessions` rows.

This task does not enable formal research data collection and does not enable gameplay log submission.

## Pre-flight Boundary

Before starting, confirm:

- no real student names or contact details are used;
- the name-to-code matching list is not stored in Supabase;
- `POST /api/logs-batch` remains disabled;
- Production keeps `RESEARCH_BACKEND_ENABLED=false`;
- Preview or Development uses `RESEARCH_BACKEND_ENABLED=dry_run`;
- real `SUPABASE_URL` and `SUPABASE_SECRET_KEY` are stored only in Vercel or `.env.local`, never in git.

## Step 1: Supabase Project

- [ ] Create or open the dedicated Supabase project for the dry-run.
- [ ] Confirm the project is not shared with unrelated student data.
- [ ] Record the Supabase region in a private researcher note, not in the repository.

## Step 2: Apply Schema

In the Supabase SQL editor:

- [ ] Apply `docs/supabase-schema-v1.sql`.
- [ ] Confirm these tables exist:
  - `participants`;
  - `game_sessions`;
  - `event_logs`;
  - `checkpoint_responses`;
  - `assessment_responses`;
  - `research_scores`;
  - `derived_indicators`;
  - `export_batches`.
- [ ] Confirm Row Level Security is enabled on research tables.

## Step 3: Insert Dry-run Seed

In the Supabase SQL editor:

- [ ] Apply `docs/supabase-seed-dryrun.sql`.
- [ ] Confirm `YW-001` exists as included / scaffolded.
- [ ] Confirm `YW-002` exists as included / standard.
- [ ] Confirm `YW-999` exists as excluded.
- [ ] Confirm no real personal identifiers are present in `participants`.

## Step 4: Vercel Environment Variables

Detected Vercel project:

- Project name: `ziqiang-game`
- Project id: `prj_1vBLiQics6OzzfHM7QhU9tDeHGOR`
- Team id: `team_6KoCGrIgAQgujO0mmQIN1b1L`
- Production domain: `ziqiang-game.vercel.app`

In Vercel Preview or Development:

- [ ] Add `SUPABASE_URL`.
- [ ] Add `SUPABASE_SECRET_KEY` as a server-side/sensitive variable.
- [ ] Add `SUPABASE_SCHEMA=public`.
- [ ] Add `RESEARCH_BACKEND_ENABLED=dry_run`.
- [ ] Add `RESEARCH_COHORT=lkkc-may-june-2026`.
- [ ] Add `APP_VERSION=dev-v0.1` or the current dry-run app version.
- [ ] Keep Production `RESEARCH_BACKEND_ENABLED=false`.
- [ ] Redeploy Preview after changing environment variables.

## Step 5: Run Live QA Script

Use the deployed Preview URL:

```bash
DRYRUN_QA_BASE_URL="https://your-preview-url.vercel.app" npm run check:live-dryrun
```

Expected:

- [ ] Missing codes return `400 missing_codes`.
- [ ] `YW-001` + `LKKC-2026-DRYRUN` returns `200` with a limited session object.
- [ ] `YW-999` + `LKKC-2026-DRYRUN` returns `403 invalid_or_excluded_participant`.
- [ ] Wrong session code returns `403 invalid_or_excluded_participant`.
- [ ] `POST /api/logs-batch` returns `501 supabase_not_connected`.

## Step 6: Browser Research Login

Open:

```text
https://your-preview-url.vercel.app/?mode=research
```

Check:

- [ ] Research login gate appears.
- [ ] Login copy asks for participant code and session code only.
- [ ] The page warns students not to enter a real name.
- [ ] `YW-001` + `LKKC-2026-DRYRUN` enters the game.
- [ ] Browser session storage contains only the limited research session object.
- [ ] `YW-999` + `LKKC-2026-DRYRUN` is rejected.
- [ ] Default non-research URL remains playable without the research gate.

## Step 7: Supabase Row Check

After successful `YW-001` login:

- [ ] One or more dry-run `game_sessions` rows exist for `YW-001`.
- [ ] The row includes `app_version`, `research_cohort`, and safe device fields.
- [ ] The row does not include a student name or name-to-code linkage.
- [ ] No `event_logs` row is created by Task 13.

## Stop Conditions

Stop and fix before any student-facing pilot if:

- the API returns participant notes;
- the API returns `session_code`;
- a wrong session code succeeds;
- an excluded participant succeeds;
- `POST /api/logs-batch` accepts logs;
- the frontend imports Supabase SDK;
- Production has `RESEARCH_BACKEND_ENABLED=dry_run`;
- real student identifiers appear in Supabase.

## Result Recording

Use `docs/task-13-first-preview-dryrun-results-template.md` to record the Preview URL, date, operator, pass/fail status, and any follow-up actions.
