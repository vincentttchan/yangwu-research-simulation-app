# Task 19 Pilot Data Capture / First Real Research Dry-run

Status: operational protocol and QA checklist  
Formal research data collection status: not ready for formal research data collection

## Purpose

Task 19 is the first end-to-end pilot data capture rehearsal for the research simulation. It checks whether the deployed site, research login, gameplay instrumentation, Supabase tables, export views, and CSV QA workflow can form one reliable research cycle.

This task is not formal student data collection. Use dry-run participant codes only, do not use real students, and do not enter real names, school account identifiers, emails, phone numbers, or the name-to-code matching list.

## Dry-run Scope

Recommended deployment URL:

```text
https://yangwu-research-simulation-app.vercel.app/?mode=research
```

Use:

- Participant code `YW-001` with session code `LKKC-2026-DRYRUN`
- Participant code `YW-002` with session code `LKKC-2026-DRYRUN`

Recommended minimum run:

- one scaffolded-condition route with `YW-001`;
- one standard-condition route with `YW-002`, if time permits;
- at least one full or near-full gameplay route per code;
- no real student data or real written assessment responses.

## Pre-flight Checklist

Before opening the site:

- [ ] Confirm Vercel Production or Preview has `RESEARCH_BACKEND_ENABLED=dry_run` only for the intended dry-run environment.
- [ ] Confirm `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_SCHEMA`, `RESEARCH_COHORT`, and `APP_VERSION` are present in Vercel for the intended environment.
- [ ] Confirm the Supabase project is `yangwu-research-lkkc-2026`.
- [ ] Confirm `YW-001` and `YW-002` exist in `participants` with `consent_status = 'included'`.
- [ ] Confirm excluded or wrong codes still fail login.
- [ ] Keep the name-to-code list outside Supabase and outside the app repository.
- [ ] Prepare a private researcher note for date, operator, device, browser, and deployment URL.

## Browser Run Checklist

Open the research URL with `?mode=research`.

For each dry-run participant code:

- [ ] Research login appears and asks only for participant code and session code.
- [ ] Login succeeds with `YW-001` or `YW-002` plus `LKKC-2026-DRYRUN`.
- [ ] Login fails with a wrong session code.
- [ ] The normal non-research URL remains playable without the research gate.
- [ ] Play long enough to enter at least one city and complete at least one evidence task.
- [ ] Open at least one historical event.
- [ ] Make at least one decision.
- [ ] Reach settlement if feasible.

Expected event coverage after a strong dry-run:

- `session_start`
- `city_entered`
- `evidence_task_completed`
- `event_opened`
- `decision_selected`
- `session_end`

If `session_end` is absent because the session is intentionally partial, record the reason in the Task 19 results template.

## Supabase Row Check

After the browser run, use Supabase SQL Editor to inspect rows.

Run the Task 16 QA file:

```text
docs/supabase-research-qa-queries.sql
```

Minimum expected evidence:

- [ ] `game_sessions` has a new row for the dry-run participant code.
- [ ] `event_logs` has rows linked to the same `session_id`.
- [ ] `event_logs.participant_code` matches `game_sessions.participant_code`.
- [ ] Event types include several of the expected gameplay events.
- [ ] `app_version`, `research_cohort`, and `content_map_version` are populated.
- [ ] `complexity_dimensions` are present on real gameplay events where expected.
- [ ] Privacy QA returns zero rows.
- [ ] No payload contains `choice_label`, `response_text`, `name`, `real_name`, `name_to_code`, `student_id`, `email`, `phone`, or `notes`.

## CSV Re-export

After Supabase row checks, export the six researcher views again.

Use these exact filenames:

- `dataset_session_summary.csv`
- `dataset_event_log_long.csv`
- `dataset_complexity_exposure.csv`
- `dataset_assessment_scores.csv`
- `dataset_dashboard_overview.csv`
- `dataset_privacy_exceptions.csv`

If an export view has zero data rows, create or keep a header-only CSV with the required columns from `docs/researcher-csv-export-manifest.md`.

Put all six CSVs in one local folder, then run:

```bash
npm run check:research-csv-export -- /path/to/export-folder
```

Expected CSV QA:

- required files exist;
- required columns are present;
- `live_dryrun_qa` is excluded from formal exports;
- `dataset_privacy_exceptions.csv` has no data rows;
- obvious personal-data columns are absent;
- app, cohort, and content version fields are present.

## Research Interpretation Note

After the CSV QA passes, write a short private researcher note using `docs/task-19-pilot-dryrun-results-template.md`.

Use this interpretation boundary:

- RQ1: this dry-run does not answer learning outcomes. It only checks whether assessment-score exports are structurally ready for future HEA, HNET, Transfer Task, and PAQ data.
- RQ2: event logs can be used to inspect engagement, route coverage, evidence-task completion, decision timing, and historical-complexity exposure during the dry-run.
- RQ3: this dry-run does not answer student perception. It only checks whether log summaries could later contextualise focus group sampling and interpretation.

Do not describe higher event counts as better learning. Treat them as engagement or exposure evidence only.

## Stop / Fix Conditions

Stop before any student-facing pilot if:

- real student identifiers appear in Supabase;
- login accepts an excluded participant or wrong session code;
- frontend code exposes Supabase secrets;
- event payload includes visible prose, answer text, names, contact details, or name-to-code fields;
- event rows are not linked to valid sessions;
- privacy QA returns data rows;
- CSV QA fails;
- Production is accidentally configured for research dry-run when the intended test is Preview only.

## Output Of Task 19

Task 19 is complete only when:

- at least one dry-run participant has created a session and gameplay event rows;
- Supabase row QA has been reviewed;
- all six CSV files have been exported or created as header-only files where appropriate;
- `npm run check:research-csv-export -- /path/to/export-folder` passes;
- the results template records what happened and what still needs fixing.

Even after Task 19 passes, the project remains not ready for formal research data collection until consent procedures, final app/content version, instrument administration, assessment coding, export audit, and school implementation arrangements are confirmed.
