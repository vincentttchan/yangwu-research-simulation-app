# Task 25 Front-End UI Evidence / Checkpoint Dry-Run

Date: 2026-06-15 HKT

Status: superseded by Task 26; front-end and Supabase export visibility are now confirmed.

Task 26 correction: the original Task 25 Supabase `0 row` finding was caused by stale SQL remaining in the Supabase SQL Editor, not by a Vercel / Supabase environment mismatch. A clean re-run in Task 26 confirmed that the Task 25 `source_opened` and `checkpoint_submitted` rows are visible in `research_event_log_long_export`.

## Purpose

Task 25 checks whether the production UI can generate the new Task 23A event coverage through actual player interactions, not API-only insertion.

The dry-run used the production UI at:

`https://yangwu-research-simulation-app.vercel.app/?mode=research`

This remains dry-run QA data, not formal student data.

## Dry-Run Identity

| Field | Value |
| --- | --- |
| Participant code | `YW-001` |
| Session code | `LKKC-2026-DRYRUN` |
| Production UI session id | `c8c8f86f-3497-4062-8b7d-92b1cfbb2be1` |
| App version | `lkkc-pilot-v1.0` |
| Research cohort | `lkkc-may-june-2026` |
| Content map version | `content-freeze-lite-v0.1` |
| Route | `lihongzhang` |
| City | `beijing` |
| Device/browser | desktop Chrome, 1280 x 800 |

## Front-End Actions Tested

The following actions were completed through the front-end production UI:

1. Opened the research version with `?mode=research`.
2. Logged in with `YW-001` and `LKKC-2026-DRYRUN`.
3. Selected the Li Hongzhang route.
4. Entered Beijing through the map city seal.
5. Completed the first two pinned event choices.
6. Opened the Beijing `bj-wall` hotspot evidence task.
7. Used the unlocked `bj-zongli` facility and selected a facility challenge option.

These steps generated the target event types from UI interactions:

| Event type | UI source | Observed payload signal |
| --- | --- | --- |
| `source_opened` | Beijing `bj-wall` hotspot evidence task | `source = hotspot`, `task_type = classify`, `evidence_task_id = beijing:bj-wall` |
| `checkpoint_submitted` | Beijing `bj-zongli` facility challenge | `checkpoint_type = facility_challenge`, `checkpoint_correct = true`, `attempt_index = 0` |

This confirms that the new event coverage can be generated from the front-end flow and is not API-only.

## Production API Evidence

The production UI sent `/api/logs-batch` requests for the target events. The relevant request payloads included:

- `source_opened` with `route_id = lihongzhang`, `city_id = beijing`, `event_id = e_bj_wall`, `source = hotspot`, and `task_type = classify`.
- `checkpoint_submitted` with `route_id = lihongzhang`, `city_id = beijing`, `checkpoint_type = facility_challenge`, `checkpoint_correct = true`, and `attempt_index = 0`.

After attaching a response listener and triggering another UI event, the production API returned:

`200 {"accepted":true,"inserted_count":1}`

This indicates that the deployed function accepted the UI-generated log batch and reported an inserted row.

## Supabase Verification

Supabase project checked in the dashboard:

`yangwu-research-lkkc-2026`

Target view checked:

`research_event_log_long_export`

Read-only event query used:

```sql
select
  event_type,
  participant_code,
  session_id,
  route_id,
  city_id,
  event_id,
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
  and session_id = 'c8c8f86f-3497-4062-8b7d-92b1cfbb2be1'
  and event_type in ('source_opened', 'checkpoint_submitted')
order by server_time desc;
```

Result in the checked Supabase project:

`0 row`

Diagnostic raw-table query against `event_logs` for the same participant/session/event types also returned:

`0 row`

Diagnostic `game_sessions` / `participants` checks for `YW-001` in the checked Supabase project also returned no matching rows.

## Interpretation

Task 26 supersedes this section. Task 25 confirms the front-end event coverage and production API acceptance, and Task 26 confirms that the rows are visible in the intended `yangwu-research-lkkc-2026` Supabase project.

Original finding, now corrected:

The first Supabase check appeared to return `0 row`, but the SQL Editor had retained stale SQL content and produced a syntax-error state. After using a clean select/delete/paste/run method, the rows appeared.

This was a SQL QA method issue, not an environment-target mismatch and not a front-end instrumentation failure.

## Privacy QA

Read-only privacy QA query:

```sql
select count(*) as privacy_exception_rows
from research_privacy_exception_export;
```

Result in the checked Supabase project:

`0 row`

No privacy exception rows were visible in the checked export view during this dry-run QA.

## Research Meaning

This dry-run supports RQ2 process-data readiness only at the technical event-generation level:

- `source_opened` can document source/evidence-task exposure.
- `checkpoint_submitted` can document scaffold/checkpoint response opportunities.
- These process events do not prove student understanding.
- HEA, HNET, Transfer Task, PAQ, and focus group evidence remain necessary for learning-outcome and perception claims.

## Current Gate Status

| Gate | Status | Note |
| --- | --- | --- |
| Production UI login | Pass | `YW-001` / `LKKC-2026-DRYRUN` created a production UI session. |
| Front-end `source_opened` | Pass | Generated by opening a hotspot evidence task through the UI. |
| Front-end `checkpoint_submitted` | Pass | Generated by submitting a facility challenge through the UI. |
| Production API acceptance | Pass | `/api/logs-batch` returned `200` and `inserted_count = 1`. |
| Intended Supabase export visibility | Pass after Task 26 correction | `research_event_log_long_export` shows `source_opened` and `checkpoint_submitted` for the production UI session. |
| Privacy QA | Pass in checked project | `research_privacy_exception_export` returned `0 row`. |

## Required Next Step

Before formal pilot data collection, use the corrected SQL Editor QA method from Task 26 when checking Supabase rows. The next verification should be a short repeat front-end dry-run and then Task 22 results-template update.

## Links To Previous Gates

Task 25 depends on the event coverage implemented in Task 23A and the export handoff recorded in Task 24.

Task 22 device and school-network QA remains a separate gate. Task 25 does not clear iPad, phone, or school-network readiness.
