# Task 23B Deployment And Live Row QA

Status: ready for deployment execution  
Formal research data collection status: not approved until live row QA and privacy QA are completed after redeployment

## Purpose

Task 23B moves the Task 23A event coverage implementation from local code into the production deployment and checks that the live Supabase project receives the new process events:

- `source_opened`
- `checkpoint_submitted`

These events support RQ2 process and engagement analysis only. They must not be interpreted as direct evidence of historical understanding without HEA, HNET, Transfer Task, PAQ, written notes, and focus group evidence.

## Production Target

- Production URL: `https://yangwu-research-simulation-app.vercel.app/?mode=research`
- Vercel project: `yangwu-research-simulation-app`
- GitHub repository: `vincentttchan/yangwu-research-simulation-app`
- Branch: `main`
- Supabase project: `yangwu-research-lkkc-2026`
- Expected app version: `lkkc-pilot-v1.0`
- Expected research cohort: `lkkc-may-june-2026`
- Expected content map version: `content-freeze-lite-v0.1`

## Deployment Checklist

1. Run local implementation checks.
2. Commit and push the Task 18-23 research backend, export, runbook, QA, and event coverage files to GitHub `main`.
3. Confirm Vercel production redeploy is ready.
4. Re-run `docs/supabase-research-export-queries.sql` in Supabase SQL Editor because `research_event_log_long_export` gained new Task 23A columns.

## Live Gameplay QA Procedure

Use a dry-run participant only:

- Participant code: `YW-001`
- Session code: `LKKC-2026-DRYRUN`

Steps:

1. Open the production URL with `?mode=research`.
2. Log in as `YW-001`.
3. Start or continue the simulation.
4. Open one evidence or hotspot task. This should create `source_opened`.
5. Complete one event challenge or facility challenge. This should create `checkpoint_submitted`.
6. Allow the page a few seconds to flush queued logs.

## Supabase Row Verification Query

Run this in Supabase SQL Editor after the live gameplay QA:

```sql
select
  event_type,
  participant_code,
  session_id,
  payload ->> 'route_id' as route_id,
  payload ->> 'city_id' as city_id,
  payload ->> 'event_id' as event_id,
  payload ->> 'source' as source,
  payload ->> 'task_type' as task_type,
  payload ->> 'checkpoint_type' as checkpoint_type,
  payload ->> 'checkpoint_correct' as checkpoint_correct,
  payload ->> 'attempt_index' as attempt_index,
  app_version,
  research_cohort,
  content_map_version,
  server_time
from event_logs
where participant_code = 'YW-001'
  and event_type in ('source_opened', 'checkpoint_submitted')
order by server_time desc
limit 30;
```

Expected result:

- At least one `source_opened` row.
- At least one `checkpoint_submitted` row.
- `app_version = 'lkkc-pilot-v1.0'`.
- `research_cohort = 'lkkc-may-june-2026'`.
- `content_map_version = 'content-freeze-lite-v0.1'`.
- No personal data or free-text response in `payload`.

## Export View Verification Query

After re-running `docs/supabase-research-export-queries.sql`, confirm the export view exposes the new columns:

```sql
select
  event_type,
  participant_code,
  session_id,
  source,
  task_type,
  checkpoint_type,
  checkpoint_correct,
  attempt_index,
  app_version,
  research_cohort,
  content_map_version,
  server_time
from research_event_log_long_export
where participant_code = 'YW-001'
  and event_type in ('source_opened', 'checkpoint_submitted')
order by server_time desc
limit 30;
```

Expected result:

- The query runs without missing-column errors.
- New columns are visible in the result grid.
- `source_opened` normally includes `source = 'hotspot'` and a `task_type`.
- `checkpoint_submitted` normally includes `checkpoint_type`, `checkpoint_correct`, and `attempt_index`.

## Privacy QA Query

Run:

```sql
select *
from research_privacy_exception_export
limit 20;
```

Expected result:

- `0 rows`.

If rows appear, do not use the export package for formal research analysis until the payload source is identified and fixed.

## CSV Export Follow-up

After the live rows are visible:

1. Export the six researcher CSVs from Supabase.
2. Include empty CSV files for views with zero rows, especially `dataset_assessment_scores.csv` and `dataset_privacy_exceptions.csv`.
3. Run:

```bash
npm run check:research-csv-export -- /path/to/export-folder
```

## Completion Criteria

Task 23B is complete when:

- GitHub `main` contains the Task 23A implementation.
- Vercel production has redeployed successfully.
- Supabase export views have been re-applied.
- `source_opened` and `checkpoint_submitted` appear in live dry-run rows.
- Privacy QA returns zero rows.
- CSV export QA passes after re-export.
