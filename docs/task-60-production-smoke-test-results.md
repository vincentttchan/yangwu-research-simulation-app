# Task 60: Production Smoke Test Results

Date: 2026-06-18
Project: Yangwu Research Simulation
Cohort: `lkkc-may-june-2026`
Status: Production deployment and smoke test passed, with direct Supabase SQL visual row check still available as an optional manual confirmation.

## Deployment

| Field | Result |
|---|---|
| Production alias | `https://yangwu-research-simulation-app.vercel.app` |
| Deployment URL | `https://yangwu-research-simulation-7cwe4nf0p-vincentchanchyv-s-projects.vercel.app` |
| Deployment ID | `dpl_F3aHxYg2bBELH6uB4hZYorwndckw` |
| Ready state | `READY` |
| Target | `production` |
| Build | Pass |

Build note: Vite reported the known non-fatal notice that `src/research/logger.js` is both dynamically and statically imported. The deployment completed successfully.

## Frozen Version Markers

| Field | Expected | Observed |
|---|---|---|
| `APP_VERSION` | `lkkc-formal-ui-freeze-v1.0` | `lkkc-formal-ui-freeze-v1.0` |
| `RESEARCH_COHORT` | `lkkc-may-june-2026` | `lkkc-may-june-2026` |
| `content_map_version` | `content-freeze-formal-v1.0` | `content-freeze-formal-v1.0` |
| `RESEARCH_BACKEND_ENABLED` | `dry_run` | `dry_run` |
| `SUPABASE_SCHEMA` | `public` | `public` |

## Check Account Used

| Purpose | Participant code | Session code |
|---|---|---|
| Teacher/researcher production check | `YW-190` | `S490` |

No formal student accounts from `YW-101` to `YW-130` were used.

## API Smoke Test

Production API login and event write passed.

| Check | Result |
|---|---|
| `/api/login` with `YW-190 / S490` | Pass |
| Login returned pseudonymous participant only | Pass |
| Login returned frozen app version | Pass |
| `/api/logs-batch` accepted QA event | Pass |
| Inserted event count | `1` |
| Session ID | `f8cf2472-ed14-4bf9-910e-b0f42d2123fe` |
| QA event marker | `task59-prod-smoke-1781775807824` |

The API response reported `inserted_count = 1`, which confirms the production server accepted and wrote the QA event through the backend path.

## UI Smoke Test

The production `?mode=research` UI was checked in the in-app browser.

| Check | Result |
|---|---|
| Research login modal appears in Chinese | Pass |
| No real name/student ID/email/phone requested | Pass |
| `YW-190 / S490` accepted in UI | Pass |
| Login modal closed after successful login | Pass |
| HTML app version marker shows `lkkc-formal-ui-freeze-v1.0` | Pass |
| Research cohort marker shows `lkkc-may-june-2026` | Pass |
| Main game screen visible after login | Pass |
| Route selection screen reachable | Pass |
| Li Hongzhang route opening reachable | Pass |
| Browser console error logs during checked path | `0` |

## Runtime Logs

Vercel runtime logs for deployment `dpl_F3aHxYg2bBELH6uB4hZYorwndckw` showed:

- `POST /api/login` -> `200`
- `POST /api/logs-batch` -> `200`
- `GET /api/research-env-diagnostic` -> `200`

No server error log appeared in the checked runtime window.

## Supabase Boundary

Direct Supabase SQL visual inspection was not completed from this environment because local `vercel env run` exposed the relevant Production variable names but not their decrypted values. However:

- production `/api/login` returned a valid session row;
- production `/api/logs-batch` returned `inserted_count = 1`;
- Vercel runtime logs confirm both API requests returned `200`;
- the diagnostic endpoint confirmed the production Supabase URL points to the expected project ref.

Optional manual SQL confirmation in Supabase:

```sql
select
  session_id,
  participant_code,
  class_id,
  condition,
  consent_status,
  app_version,
  research_cohort,
  content_map_version,
  device_category,
  browser_family,
  started_at
from game_sessions
where session_id = 'f8cf2472-ed14-4bf9-910e-b0f42d2123fe';

select
  event_type,
  participant_code,
  session_id,
  payload ->> 'route_id' as route_id,
  payload ->> 'source' as source,
  payload ->> 'smoke_marker' as smoke_marker,
  app_version,
  research_cohort,
  content_map_version,
  server_time
from event_logs
where session_id = 'f8cf2472-ed14-4bf9-910e-b0f42d2123fe'
  and event_type = 'production_smoke_qa'
order by server_time desc;
```

Expected result:

- one `game_sessions` row for `YW-190`;
- one `production_smoke_qa` event row with marker `task59-prod-smoke-1781775807824`;
- both rows show `lkkc-formal-ui-freeze-v1.0`, `lkkc-may-june-2026`, and `content-freeze-formal-v1.0`;
- event payload should not contain `choice_label`, `response_text`, `student_id`, `email`, `phone`, or real-name fields.

## Decision

Production deployment and smoke test are passed for the formal UI freeze build.

The game is ready for final operational preparation using the frozen production URL, subject to the normal collection-day checks and the optional direct Supabase SQL confirmation above.
