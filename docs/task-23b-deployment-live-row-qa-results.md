# Task 23B Deployment And Live Row QA Results

Date: 2026-06-14  
Operator: Codex with Vincent  
Status: production deployment verified; production API event insert verified; Supabase SQL row inspection pending in dashboard

## Deployment Result

- Git commit: `8de8c1d feat: deploy research event coverage QA`
- Git branch: `main`
- Production URL: `https://yangwu-research-simulation-app.vercel.app/?mode=research`
- Vercel deployment status: Ready
- Latest production asset check:
  - `assets/index-D2KZO0oa.js`
  - `assets/index-CVtaNtMW.css`
- Local build produced the same asset hashes before push.

## Local Verification Completed Before Push

Passed:

```bash
npm run check:deployment-live-row-qa
npm run check:event-coverage-implementation
npm run check:instrumentation
npm run check:supabase-logs
npm run check:research-csv-export -- tests/fixtures/task18-research-export
npm run check:backend-boundary
npm run check:syntax
npm run build
```

Build note:

- Vite still reports the known non-fatal warning that `src/research/logger.js` is both dynamically and statically imported.

## Production API Smoke Test

Passed:

```bash
DRYRUN_QA_BASE_URL="https://yangwu-research-simulation-app.vercel.app" npm run check:live-dryrun
```

Result:

- login accepted for `YW-001`;
- invalid participant/session checks behaved as expected;
- `live_dryrun_qa` log batch inserted successfully.

## Task 23B Event Insert Verification

Production API insert test:

- Participant code: `YW-001`
- Session code: `LKKC-2026-DRYRUN`
- Session ID: `4c8268e7-8862-4db2-a519-84a36550b96a`
- Marker: `1781430287109`
- Inserted events: `2`
- Event types:
  - `source_opened`
  - `checkpoint_submitted`
- Payload route marker: `task23b-live-qa`
- Expected app version: `lkkc-pilot-v1.0`
- Expected research cohort: `lkkc-may-june-2026`
- Expected content map version: `content-freeze-lite-v0.1`

Important boundary:

- This API insert confirms production server allowlisting and Supabase insert path.
- A full UI gameplay click-through for opening a real hotspot and submitting a real checkpoint should still be done once manually or with a longer browser automation script before formal student use.

## Supabase SQL To Confirm These Rows

Run:

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
  and session_id = '4c8268e7-8862-4db2-a519-84a36550b96a'
  and payload ->> 'route_id' = 'task23b-live-qa'
order by server_time desc;
```

Expected result:

- exactly two rows or at least the two marked rows above;
- one `source_opened`;
- one `checkpoint_submitted`;
- no `response_text`, `choice_label`, `student_id`, or `email` keys remain in payload.

## Export View SQL Still Required

Re-run the full file in Supabase SQL Editor:

```text
docs/supabase-research-export-queries.sql
```

Then confirm:

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
  content_map_version
from research_event_log_long_export
where participant_code = 'YW-001'
  and session_id = '4c8268e7-8862-4db2-a519-84a36550b96a'
  and route_id = 'task23b-live-qa'
order by server_time desc;
```

Expected result:

- query runs without missing-column errors;
- Task 23A columns are visible.

## Privacy QA Still Required

Run:

```sql
select *
from research_privacy_exception_export
limit 20;
```

Expected result:

- `0 rows`.

## Current Decision

Task 23B deployment path is functioning. Before this is treated as fully complete for pilot readiness, Vincent should:

1. re-run export views in Supabase;
2. inspect the marked rows above;
3. run privacy QA and confirm zero rows;
4. complete one front-end UI evidence/checkpoint dry-run if possible;
5. re-export CSVs and run CSV QA.
