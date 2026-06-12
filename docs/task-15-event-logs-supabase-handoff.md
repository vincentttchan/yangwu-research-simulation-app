# Task 15 Event Logs Supabase Handoff

Status: implemented for dry-run validation  
Formal research collection status: not ready for formal research data collection

## Current Scope

Task 15 connects the existing local research event queue to the server-side Vercel API route `POST /api/logs-batch`.

The route writes to Supabase only when:

- `RESEARCH_BACKEND_ENABLED=dry_run`;
- server-side Supabase environment variables are available;
- the browser submits a valid limited research session object;
- the event batch passes the server-side sanitizer.

If the backend is not enabled, the API still returns `501 supabase_not_connected`.

## Data Flow

1. Gameplay instrumentation writes low-risk events into `yangwu_research_event_queue_v1`.
2. Research login creates a limited `game_sessions` row and returns a compact session object.
3. After a valid session exists, the login gate attempts a non-blocking queue flush.
4. Successful flushes clear the local queue.
5. Failed flushes keep the local queue for retry.

## Supabase Target

Accepted events are inserted into `event_logs`.

The inserted row includes:

- `session_id`;
- `participant_code`;
- `client_event_id`;
- `event_type`;
- sanitized `payload`;
- `constructs`;
- `complexity_dimensions`;
- `client_time`;
- `app_version`;
- `research_cohort`;
- `content_map_version`.

## Privacy Boundary

The server allowlist keeps only structured gameplay/research fields. It intentionally excludes visible choice prose, payoff prose, student free text, names, emails, phone numbers, and name-to-code linkage.

The frontend still does not import the Supabase SDK and does not read `SUPABASE_SECRET_KEY`.

## QA

Local checks:

```bash
npm run check:supabase-logs
npm run check:backend-boundary
npm run check:supabase-env
npm run check:live-dryrun
```

Live dry-run QA now expects `POST /api/logs-batch` to accept one safe test event after `YW-001` login.

## Remaining Before Formal Use

- Confirm consent and withdrawal workflow.
- Confirm final app version and content map version.
- Confirm participant code list and session codes.
- Confirm Supabase export/deletion procedure.
- Run a final live QA pass immediately before classroom use.
