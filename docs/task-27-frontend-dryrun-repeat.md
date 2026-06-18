# Task 27 Front-End Dry-Run Repeat

Date: 2026-06-15 HKT

Status: pass for remote desktop production data-path QA; device and school-network QA still pending.

## Purpose

Task 27 repeats the front-end dry-run after Task 26 confirmed that Vercel Production is aligned with the intended Supabase project.

This task checks the production research URL:

`https://yangwu-research-simulation-app.vercel.app/?mode=research`

This remains dry-run QA data. It is not formal student data collection and does not provide evidence of student learning outcomes.

## Production Identity

| Field | Value |
| --- | --- |
| Participant code | `YW-001` |
| Session code | `LKKC-2026-DRYRUN` |
| App version | `lkkc-pilot-v1.0` |
| Research cohort | `lkkc-may-june-2026` |
| Content map version | `content-freeze-lite-v0.1` |
| Browser / device | Remote desktop Chrome automation, 1280 x 800 |

## Front-End Dry-Run Sessions

Two short dry-run sessions were used because the first session exercised source/evidence/event flow, while the second session specifically exercised a facility checkpoint.

| Session id | Purpose |
| --- | --- |
| `e8317a6f-9df2-41c4-a027-5569b9f6a742` | Login, route entry, Beijing city entry, `bj-wall` source task, evidence classification, linked event decision. |
| `00b5db59-d942-47e7-85b6-c3915ca9f729` | Login, route entry, Beijing city entry, `bj-junji` facility study, checkpoint submission. |

## Actions Completed

Task 27 completed these actions through the production front-end:

1. Opened the research URL with `?mode=research`.
2. Logged in with `YW-001` and `LKKC-2026-DRYRUN`.
3. Selected the Li Hongzhang route.
4. Advanced through the route cutscene and reached the map.
5. Entered Beijing.
6. Opened the `bj-wall` hotspot evidence task.
7. Completed the `classify` evidence task by assigning the source statements to the correct categories.
8. Submitted the evidence task.
9. Opened the linked historical event and selected one decision.
10. In a separate session, opened the `bj-junji` facility study and submitted its challenge response.

## Production API Evidence

The production API returned successful `/api/login` and `/api/logs-batch` responses.

For session `e8317a6f-9df2-41c4-a027-5569b9f6a742`, observed log batch responses included:

| Endpoint | Status | Body |
| --- | ---: | --- |
| `/api/logs-batch` | 200 | `{"accepted":true,"inserted_count":3}` |
| `/api/logs-batch` | 200 | `{"accepted":true,"inserted_count":1}` |
| `/api/logs-batch` | 200 | `{"accepted":true,"inserted_count":1}` |
| `/api/logs-batch` | 200 | `{"accepted":true,"inserted_count":1}` |

For session `00b5db59-d942-47e7-85b6-c3915ca9f729`, observed log batch responses included:

| Endpoint | Status | Body |
| --- | ---: | --- |
| `/api/logs-batch` | 200 | `{"accepted":true,"inserted_count":2}` |
| `/api/logs-batch` | 200 | `{"accepted":true,"inserted_count":2}` |

## Supabase Export Verification

Supabase project checked:

`yangwu-research-lkkc-2026`

Query used:

```sql
select event_type, participant_code, session_id::text, route_id, city_id,
       event_id, source, task_type, checkpoint_type, checkpoint_correct,
       attempt_index, app_version, research_cohort, content_map_version,
       server_time::text
from research_event_log_long_export
where participant_code = 'YW-001'
  and session_id in ('e8317a6f-9df2-41c4-a027-5569b9f6a742', '00b5db59-d942-47e7-85b6-c3915ca9f729')
  and event_type in ('source_opened', 'evidence_task_completed', 'decision_selected', 'checkpoint_submitted')
order by session_id, server_time;
```

Result:

`4 rows`

Visible rows:

| Event type | Session id | Key visible values |
| --- | --- | --- |
| `checkpoint_submitted` | `00b5db59-d942-47e7-85b6-c3915ca9f729` | `YW-001`, `lihongzhang`, `beijing`, `facility_challenge`, `true` |
| `source_opened` | `e8317a6f-9df2-41c4-a027-5569b9f6a742` | `YW-001`, `lihongzhang`, `beijing`, `e_bj_wall`, `hotspot`, `classify` |
| `evidence_task_completed` | `e8317a6f-9df2-41c4-a027-5569b9f6a742` | `YW-001`, `lihongzhang`, `beijing`, `e_bj_wall`, `classify` |
| `decision_selected` | `e8317a6f-9df2-41c4-a027-5569b9f6a742` | `YW-001`, `lihongzhang`, `beijing`, `e_yuanmingyuan` |

## Privacy QA

Query used:

```sql
select count(*) as privacy_exception_rows
from research_privacy_exception_export;
```

Result:

`0`

No privacy exception rows were visible during Task 27.

## QA Notes

- The production data path is repeatable after Task 26: front-end interaction can create logs, `/api/logs-batch` accepts them, and export views show them.
- In headless desktop automation, the coachmark layer sometimes intercepted pointer clicks even when marked `aria-hidden="true"`. DOM click was used to continue the dry-run through the same front-end handlers. This should be rechecked manually on real iPad and phone devices during Task 22.
- The selected historical event did not produce an event-challenge checkpoint in that specific run; the checkpoint evidence was therefore collected through the Beijing `bj-junji` facility challenge.
- Event logs support RQ2 process-data readiness only. They do not demonstrate learning outcomes. HEA, HNET, Transfer Task, PAQ, and focus group data remain necessary for RQ1 and RQ3.

## Gate Status

| Gate | Status | Note |
| --- | --- | --- |
| Production research login | Pass | Fresh `YW-001` sessions were created. |
| Route and map entry | Pass | Li Hongzhang route reached map phase 6. |
| Beijing city entry | Pass | City entry was completed. |
| `source_opened` export visibility | Pass | Visible in `research_event_log_long_export`. |
| `evidence_task_completed` export visibility | Pass | Visible in `research_event_log_long_export`. |
| `decision_selected` export visibility | Pass | Visible in `research_event_log_long_export`. |
| `checkpoint_submitted` export visibility | Pass | Visible in `research_event_log_long_export`. |
| Privacy QA | Pass | `research_privacy_exception_export` returned `0`. |
| iPad / phone / school Wi-Fi QA | Pending | Must be completed under Task 22 before real student use. |

## Next Step

Proceed with Task 22 on actual target devices and school network:

- iPad Safari or Chrome;
- student-sized phone Safari or Chrome;
- Lok Sin Tong Leung Kau Kui College Wi-Fi or intended classroom network;
- optional hotspot fallback.

Task 27 improves confidence in the production data path, but it does not clear formal student deployment by itself.
