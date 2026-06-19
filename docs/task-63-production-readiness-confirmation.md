# Task 63: Production Readiness Confirmation

Date: 2026-06-19
Project: Yangwu Research Simulation
Production URL: `https://yangwu-research-simulation-app.vercel.app/?mode=research`
Git commit checked: `87a5a2b test: restore normal-flow route QA`

## Decision

Production readiness status: `Ready for controlled formal data-collection use`

This confirmation means the deployed production app, research login, backend environment, and event-write path were checked after the Task 62 normal-flow QA commit was pushed to `main`.

## Scope Of This Confirmation

This gate confirms:

- production URL opens successfully;
- production research login is active;
- development bypass is not visible in production;
- frozen version markers are present;
- Supabase backend configuration points to the expected project;
- researcher checking account can log in;
- the production event-writing endpoint accepts and stores a QA event;
- main game entry and Li Hongzhang route entry are reachable;
- no severe browser console warnings or errors appeared in the checked UI path.

This gate does not replace a final human real-device check on the actual iPad or phone model used by students.

## Version And Environment Check

| Field | Observed |
|---|---|
| `APP_VERSION` | `lkkc-formal-ui-freeze-v1.0` |
| `RESEARCH_COHORT` | `lkkc-may-june-2026` |
| `RESEARCH_BACKEND_ENABLED` | `dry_run` |
| `SUPABASE_SCHEMA` | `public` |
| Supabase URL project ref | Matches expected project |
| Supabase secret present | Yes |

## API Readiness Check

Checking account used:

| Purpose | Participant code | Session code |
|---|---|---|
| Teacher/researcher production check | `YW-190` | `S490` |

Results:

| Check | Result |
|---|---|
| Missing login codes rejected | Pass |
| `YW-190 / S490` accepted | Pass |
| Login response excludes session code | Pass |
| Login response excludes notes | Pass |
| App version returned correctly | Pass |
| Research cohort returned correctly | Pass |
| `/api/logs-batch` accepted QA event | Pass |
| Inserted event count | `1` |

Production readiness QA marker:

- `task63-readiness-1781827755746`

Production readiness QA session:

- `f0237575-ee7e-488c-bf5e-3c23032f90a9`

## UI Readiness Check

Checked path:

1. Open production URL with `?mode=research`.
2. Confirm research login modal appears in Chinese.
3. Confirm the page states that real names are not required.
4. Confirm no development bypass button appears.
5. Log in with `YW-190 / S490`.
6. Confirm login gate passes.
7. Confirm the main opening button is visible.
8. Enter the route-selection screen.
9. Confirm the Li Hongzhang route entry is reachable.

Results:

| Check | Result |
|---|---|
| Research login heading | `研究登記` |
| Real-name privacy text visible | Pass |
| Production development bypass hidden | Pass |
| App version marker | `lkkc-formal-ui-freeze-v1.0` |
| Cohort marker | `lkkc-may-june-2026` |
| Login gate passed | Pass |
| Main game opening reachable | Pass |
| Li Hongzhang route reachable | Pass |
| Severe console warnings/errors | `0` |

## Research Data Boundary

No formal student accounts were used in this readiness confirmation. The check used only the reserved teacher/researcher checking account.

The QA payload intentionally included fields that should not be retained in research logs, such as `choice_label` and `response_text`, so that the backend sanitisation path remains exercised. The API accepted the event through the normal production backend path.

## Remaining Operational Notes

Before the first formal collection session, perform a short human-facing check:

- open the production URL on the actual device type students will use;
- log in once with the checking account;
- confirm the opening screen and Li Hongzhang route entry are comfortably readable;
- confirm the teacher has the correct participant/session code slips and printed instrument packet.

## Final Readiness Statement

The production application and backend are ready for controlled formal data collection, subject to the ordinary collection-day human device check and teacher/researcher supervision.
