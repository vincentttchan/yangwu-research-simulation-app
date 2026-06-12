# Task 13 First Real Preview Dry-run Results

Status: template  
Formal research collection status: not ready for formal research data collection

## Run Metadata

| Field | Value |
|---|---|
| Date |  |
| Operator |  |
| Vercel Preview URL |  |
| Git branch / commit |  |
| App version |  |
| Supabase project label |  |
| Environment | Preview / Development |

Do not record Supabase URL, secret keys, service-role keys, or student-identifying information in this file.

## Environment Confirmation

| Check | Pass/Fail | Notes |
|---|---|---|
| `RESEARCH_BACKEND_ENABLED=dry_run` in Preview / Development |  |  |
| Production remains `RESEARCH_BACKEND_ENABLED=false` |  |  |
| `SUPABASE_SECRET_KEY` is server-side/sensitive |  |  |
| No real participant identities in Supabase |  |  |
| Name-to-code matching list is outside Supabase |  |  |

## SQL Preparation

| Check | Pass/Fail | Notes |
|---|---|---|
| `docs/supabase-schema-v1.sql` applied |  |  |
| `docs/supabase-seed-dryrun.sql` applied |  |  |
| `YW-001` included / scaffolded exists |  |  |
| `YW-002` included / standard exists |  |  |
| `YW-999` excluded exists |  |  |
| RLS enabled on research tables |  |  |

## Live QA Script

Command used:

```bash
DRYRUN_QA_BASE_URL="" npm run check:live-dryrun
```

| Case | Expected | Actual | Pass/Fail | Notes |
|---|---|---|---|---|
| Missing codes | `400 missing_codes` |  |  |  |
| `YW-001` valid login | `200` limited session object |  |  |  |
| `YW-999` excluded login | `403 invalid_or_excluded_participant` |  |  |  |
| Wrong session code | `403 invalid_or_excluded_participant` |  |  |  |
| Logs batch | `501 supabase_not_connected` |  |  |  |

## Browser QA

| Check | Pass/Fail | Notes |
|---|---|---|
| `?mode=research` shows research login gate |  |  |
| Default URL remains playable without login gate |  |  |
| Login collects only participant/session code |  |  |
| Real-name warning is visible |  |  |
| `YW-001` enters the game |  |  |
| `YW-999` is rejected |  |  |
| Session storage contains limited session object only |  |  |

## Supabase Row Check

| Check | Pass/Fail | Notes |
|---|---|---|
| `game_sessions` row created for `YW-001` |  |  |
| Row includes app/research cohort markers |  |  |
| Row includes safe device fields only |  |  |
| No `event_logs` created by Task 13 |  |  |
| No participant notes returned to browser |  |  |

## Outcome

Overall status:

- [ ] Pass: preview dry-run is ready for teacher/researcher internal testing.
- [ ] Conditional pass: fix notes below before another dry-run.
- [ ] Fail: do not proceed.

Follow-up actions:

- 

Research boundary reminder:

Task 13 passing does not mean formal research data collection is ready. Formal collection still requires final research freeze, ethics/school readiness, tested export/deletion workflow, and a separate decision to enable any process-log submission.
