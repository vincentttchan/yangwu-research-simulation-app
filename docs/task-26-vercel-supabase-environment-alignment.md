# Task 26 Vercel / Supabase Environment Alignment Sprint

Date: 2026-06-15 HKT

Status: pass, with one QA-method correction.

## Purpose

Task 26 investigates the Task 25 finding that production UI events were accepted by `/api/logs-batch` but appeared missing from the checked Supabase project.

The sprint checks whether the production Vercel deployment is aligned with the intended Supabase project:

`yangwu-research-lkkc-2026`

Expected Supabase project ref:

`zjmuydbuskxouqlkcspy`

## Root-Cause Summary

The suspected Vercel / Supabase project mismatch was not confirmed.

Production runtime diagnostic showed:

| Check | Result |
| --- | --- |
| `RESEARCH_BACKEND_ENABLED` | `dry_run` |
| `SUPABASE_URL` present | true |
| `SUPABASE_URL` project ref | `zjmuydbuskxouqlkcspy` |
| `SUPABASE_URL` matches expected project | true |
| `SUPABASE_SECRET_KEY` present | true |
| `SUPABASE_SCHEMA` | `public` |
| `RESEARCH_COHORT` | `lkkc-may-june-2026` |
| `APP_VERSION` | `lkkc-pilot-v1.0` |

The `SUPABASE_SECRET_KEY` value did not expose a JWT project ref through safe decoding. This is not treated as a failure because the production login and insert path successfully wrote to the expected Supabase project after clean SQL verification.

## Diagnostic Endpoint

Temporary safe diagnostic endpoint added:

`/api/research-env-diagnostic`

It returns only configuration metadata:

- backend mode;
- whether Supabase URL and key are present;
- Supabase URL project ref;
- schema;
- cohort;
- app version.

It does not return the full Supabase URL, the secret key, or any student data.

Before formal public deployment, decide whether to remove this endpoint or protect it behind an admin-only diagnostic token.

## Production Runtime Check

Production diagnostic URL:

`https://yangwu-research-simulation-app.vercel.app/api/research-env-diagnostic`

Observed safe response:

```json
{
  "diagnostic": "research_env_alignment",
  "expected_supabase_ref": "zjmuydbuskxouqlkcspy",
  "backend_enabled": "dry_run",
  "supabase_url_present": true,
  "supabase_url_ref": "zjmuydbuskxouqlkcspy",
  "supabase_url_matches_expected": true,
  "supabase_secret_key_present": true,
  "supabase_secret_key_ref": null,
  "supabase_secret_key_matches_expected": false,
  "supabase_schema": "public",
  "research_cohort": "lkkc-may-june-2026",
  "app_version": "lkkc-pilot-v1.0"
}
```

Interpretation:

- Vercel Production is using the intended Supabase URL.
- Vercel Production is in `dry_run` backend mode.
- The secret key is present.
- The key format is not JWT-decodable through the safe diagnostic helper, but the subsequent database write/read check confirms the backend path works.

## Live Login Write Check

A fresh production login request was sent to:

`https://yangwu-research-simulation-app.vercel.app/api/login`

Payload identity:

| Field | Value |
| --- | --- |
| Participant code | `YW-001` |
| Session code | `LKKC-2026-DRYRUN` |
| App version | `lkkc-pilot-v1.0` |
| Research cohort | `lkkc-may-june-2026` |
| Content map version | `content-freeze-lite-v0.1` |
| Browser family marker | `Task26 Playwright` |

Production API response:

```json
{
  "session": {
    "session_id": "ea9b6b2e-3b5e-492f-b460-c613223fa0f7",
    "participant_code": "YW-001",
    "class_id": "LKKC-S4A",
    "condition": "scaffolded",
    "app_version": "lkkc-pilot-v1.0",
    "research_cohort": "lkkc-may-june-2026",
    "content_map_version": "content-freeze-lite-v0.1"
  }
}
```

Supabase clean SQL verification:

```sql
select participant_code, session_id::text, app_version, research_cohort,
       content_map_version, device_category, browser_family, started_at::text
from game_sessions
where session_id = 'ea9b6b2e-3b5e-492f-b460-c613223fa0f7';
```

Result:

`1 row`

Visible values:

- `YW-001`
- `ea9b6b2e-3b5e-492f-b460-c613223fa0f7`
- `lkkc-pilot-v1.0`
- `lkkc-may-june-2026`
- `content-freeze-lite-v0.1`
- `desktop`
- `Task26 Playwright`

## Task 25 Event Row Recheck

Task 25 session:

`c8c8f86f-3497-4062-8b7d-92b1cfbb2be1`

Clean SQL verification:

```sql
select event_type, participant_code, session_id::text, route_id, city_id,
       event_id, source, task_type, checkpoint_type, checkpoint_correct,
       attempt_index, app_version, research_cohort, content_map_version,
       server_time::text
from research_event_log_long_export
where participant_code = 'YW-001'
  and session_id = 'c8c8f86f-3497-4062-8b7d-92b1cfbb2be1'
  and event_type in ('source_opened', 'checkpoint_submitted')
order by server_time desc;
```

Result:

`3 rows`

Visible event rows:

| Event type | Key visible values |
| --- | --- |
| `checkpoint_submitted` | `YW-001`, `lihongzhang`, `beijing`, `facility_challenge`, `true` |
| `source_opened` | `YW-001`, `lihongzhang`, `beijing`, `e_bj_wall`, `hotspot`, `classify` |
| `source_opened` | duplicate hotspot-open row from repeated dry-run interaction |

This confirms that the Task 25 front-end UI events did reach `research_event_log_long_export`.

## SQL Editor QA Correction

The Task 25 false negative came from the Supabase SQL Editor retaining previous SQL content in the Monaco editor. Filling the visible textbox did not fully replace the editor buffer, causing syntax errors and stale `0 row` results.

Correct SQL Editor QA method:

1. Click inside the SQL editor.
2. Select all editor content.
3. Delete the old query.
4. Paste the full new query.
5. Run with `Cmd + Enter`.
6. Confirm no `Failed to run sql query` message appears.
7. Read the result grid and row-count footer.

Do not trust a `0 row` result if the page also shows a syntax-error notification.

## Privacy QA

Clean SQL:

```sql
select count(*) as privacy_exception_rows
from research_privacy_exception_export;
```

Result:

`0`

No privacy exception rows were visible during Task 26.

## Gate Status

| Gate | Status | Note |
| --- | --- | --- |
| Vercel Production project linked locally | Pass | Project `prj_RZOtiH80OApCY9sIg9WTjdkvFqT1`, team `team_6KoCGrIgAQgujO0mmQIN1b1L`. |
| Production env metadata diagnostic | Pass | Supabase URL ref matches `zjmuydbuskxouqlkcspy`. |
| Production login write | Pass | New session visible in `game_sessions`. |
| Task 25 event export visibility | Pass | `source_opened` and `checkpoint_submitted` visible in `research_event_log_long_export`. |
| Privacy QA | Pass | `research_privacy_exception_export` count is `0`. |
| SQL QA method | Updated | Use full editor select/delete/paste before running queries. |

## Next Step

Proceed to Task 27: repeat a short front-end dry-run after this correction, then update the Task 22 results template with the confirmed production data path.

Also decide whether `/api/research-env-diagnostic` should be removed or protected before formal student-facing deployment.
