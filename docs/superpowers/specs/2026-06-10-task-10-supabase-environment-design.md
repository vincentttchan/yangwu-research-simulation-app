# Task 10 Supabase Connection / Environment Setup Design Spec

Date: 2026-06-10  
Workstream: research/logger  
Status: design spec, not implementation

## 1. Purpose

Task 10 prepares the safe environment and operational plan for connecting the Self-Strengthening Movement simulation to Supabase through Vercel API routes.

This task does not yet turn on real production login or submit gameplay logs. It defines the connection boundary, environment variables, local development setup, Vercel setup, Supabase project preparation, database migration order, RLS/grants posture, seed data requirements, and verification gates needed before any real research data is collected.

The immediate goal is to move from:

```text
prepared API shape -> safe environment setup -> controlled Supabase dry run
```

not directly from:

```text
prepared API shape -> live research database
```

## 2. Design Position

Task 10 builds on:

- Task 8A: participant-code login and Supabase research data design;
- Task 8B: backend boundary stubs;
- Task 9: `?mode=research` login gate;
- `docs/supabase-schema-v1.sql`;
- local-only logger queue `yangwu_research_event_queue_v1`.

The current app already has:

- `api/login.js` returning `supabase_not_connected`;
- `api/logs-batch.js` returning `supabase_not_connected`;
- `src/research/api.js` calling `/api/login` and `/api/logs-batch`;
- `src/research/login-gate.js` collecting only `participant_code` and `session_code`;
- `.gitignore` protection for `.env`, `.env.local`, `.env.*.local`, `.vercel`, and logs.

Task 10 should therefore avoid reworking the frontend. The next meaningful work is environment safety and server-side connection readiness.

## 3. Scope

Task 10 covers:

- Supabase project setup checklist;
- `.env.example` without real values;
- local `.env.local` instructions without storing secrets in git;
- Vercel environment variable checklist;
- server-only Supabase credential policy;
- migration and seed-data order;
- RLS/grants/policy planning;
- local dry-run strategy;
- verification scripts and acceptance criteria;
- documentation updates.

Task 10 does not:

- put real Supabase URL or keys in source control;
- ask students to create accounts;
- add email/password/social login;
- expose Supabase credentials to browser code;
- submit real event logs;
- collect real names, emails, phone numbers, school credentials, GPS, camera, microphone, or screen recording data;
- store the name-to-code matching list in Supabase;
- implement teacher dashboard or export dashboard;
- mark the database ready for formal research data collection.

## 4. Recommended Architecture

Keep the established architecture:

```text
Student browser
  -> Vite/Vercel frontend
  -> Vercel API routes
  -> server-only Supabase client
  -> Supabase PostgreSQL
```

The browser should never create a Supabase client for research data writes. It only calls first-party API routes:

- `POST /api/login`
- later `POST /api/logs-batch`

The Vercel API routes perform validation, use server-only environment variables, and return only minimal response objects to the browser.

## 5. Environment Variable Design

### 5.1 Local `.env.example`

Create an example file for names only:

```text
SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_SCHEMA=public
RESEARCH_BACKEND_ENABLED=false
RESEARCH_COHORT=lkkc-may-june-2026
APP_VERSION=dev-v0.1
```

Notes:

- `SUPABASE_URL` is the project URL.
- `SUPABASE_SECRET_KEY` is server-only and must never be exposed to frontend code.
- `SUPABASE_SCHEMA` starts as `public` because the current schema draft uses public tables.
- `RESEARCH_BACKEND_ENABLED=false` keeps local development safe by default.
- Real values belong in `.env.local` locally and Vercel environment variables remotely.

### 5.2 Forbidden Frontend Variables

Do not use `VITE_SUPABASE_*` variables for research database writes in this project. Vite variables prefixed with `VITE_` are designed to be exposed to browser code. This research app should keep Supabase credentials behind API routes.

### 5.3 Secret Handling

Use server-side secret handling only. Supabase's API key guidance states that secret keys should not be placed in source control and should be handled through controlled server-side environments. Supabase's documentation also warns that legacy service-role style credentials can bypass Row Level Security, so this project treats any privileged Supabase credential as server-only.

Reference:

- Supabase API keys documentation: https://supabase.com/docs/guides/getting-started/api-keys

## 6. Vercel Environment Setup

The Vercel project should define environment variables separately for:

- Development;
- Preview;
- Production.

Recommended first pass:

| Variable | Development | Preview | Production | Notes |
|---|---:|---:|---:|---|
| `SUPABASE_URL` | yes | yes | yes | Use same project only during early dry-run if simpler. |
| `SUPABASE_SECRET_KEY` | yes | yes | yes | Server-only. Never print full value. |
| `SUPABASE_SCHEMA` | yes | yes | yes | Start with `public`. |
| `RESEARCH_BACKEND_ENABLED` | `false` or `dry_run` | `dry_run` | `false` until research freeze | Production should not accept real writes until approved. |
| `RESEARCH_COHORT` | yes | yes | yes | `lkkc-may-june-2026`. |
| `APP_VERSION` | yes | yes | yes | Align with app versioning strategy. |

First deployment should keep `RESEARCH_BACKEND_ENABLED` disabled or dry-run until:

- schema migration is applied;
- seed participant codes are loaded;
- RLS/grants posture is confirmed;
- test participant login works;
- export/delete/withdrawal workflow is documented.

## 7. Supabase Project Setup

### 7.1 Project Creation

Create a dedicated Supabase project for this research game, not a shared personal sandbox used by unrelated apps.

Recommended project naming:

```text
yangwu-research-lkkc-2026
```

Recommended region:

- choose a region suitable for the school context and expected participants;
- record the chosen region in a private setup note, not in student-facing UI.

### 7.2 Database Migration Order

Apply migrations in this order:

1. create tables from `docs/supabase-schema-v1.sql`;
2. add grants / revoke defaults where appropriate;
3. add RLS policies;
4. insert non-identifying seed data for test participants;
5. run test login through API route;
6. run test log batch through API route only after login is proven.

### 7.3 RLS And Grants

Supabase documentation distinguishes grants and RLS policies: grants decide whether a role can reach an object, and policies decide which rows are available. RLS should be enabled for exposed tables and paired with explicit grants/policies.

Reference:

- Supabase securing your API documentation: https://supabase.com/docs/guides/api/securing-your-api
- Supabase Row Level Security documentation: https://supabase.com/docs/guides/database/postgres/row-level-security

For this project, the first implementation should use a conservative posture:

- browser has no direct Supabase access;
- API routes use server-only credentials;
- tables have RLS enabled;
- do not grant broad access to `anon`;
- avoid exposing research tables directly through frontend Supabase client;
- consider later moving internal research tables outside the public Data API surface if the project grows.

Task 10 should document policy intent before writing production policies. The immediate policy intent is:

| Table | First backend access pattern |
|---|---|
| `participants` | Server route reads by `participant_code` + `session_code`; does not return notes. |
| `game_sessions` | Server route inserts one row after valid login. |
| `event_logs` | Later server route inserts filtered event logs. |
| `checkpoint_responses` | Later server route inserts only approved text responses. |
| `assessment_responses` | Later controlled submission path; not Task 10. |
| `research_scores` | Researcher-only/manual coding path; not student browser. |
| `derived_indicators` | Researcher/export path; not student browser. |
| `export_batches` | Researcher/export path; not student browser. |

## 8. Seed Data Plan

Before testing login, create pseudonymous seed rows only.

Example seed rows:

```sql
insert into participants (
  participant_code,
  session_code,
  class_id,
  condition,
  consent_status,
  notes
) values
  ('YW-001', 'LKKC-2026-DRYRUN', 'LKKC-S4A', 'scaffolded', 'included', 'dry-run only'),
  ('YW-002', 'LKKC-2026-DRYRUN', 'LKKC-S4B', 'standard', 'included', 'dry-run only'),
  ('YW-999', 'LKKC-2026-DRYRUN', 'LKKC-TEST', 'standard', 'excluded', 'dry-run excluded case');
```

Seed data must not include:

- student names;
- school account IDs;
- email addresses;
- phone numbers;
- name-to-code linkage.

The real name-to-code matching list remains outside Supabase.

## 9. API Route Connection Behaviour

### 9.1 `POST /api/login`

When backend is disabled:

```json
{
  "error": "supabase_not_connected"
}
```

When backend is enabled and codes are valid:

```json
{
  "session": {
    "session_id": "uuid",
    "participant_code": "YW-001",
    "class_id": "LKKC-S4A",
    "condition": "scaffolded",
    "app_version": "dev-v0.1",
    "research_cohort": "lkkc-may-june-2026",
    "content_map_version": "content-freeze-lite-v0.1"
  }
}
```

When codes are missing:

```json
{
  "error": "missing_codes"
}
```

When participant is excluded, withdrawn, or mismatched:

```json
{
  "error": "invalid_or_excluded_participant"
}
```

The API must not return:

- `notes`;
- other participants;
- consent history;
- name-to-code linkage;
- Supabase error details that expose schema or credentials.

### 9.2 `POST /api/logs-batch`

Task 10 may plan this endpoint but should not enable live submission unless login dry-run is stable.

Future behaviour:

- require a valid session object;
- reject missing `session_id` or `participant_code`;
- allow only known event types from `event-taxonomy.js`;
- strip visible choice text, payoff text, and personal data;
- insert server timestamp;
- return event insert counts only.

## 10. Local Development Behaviour

Local development should remain safe:

- default app URL remains playable;
- `?mode=research` shows the gate;
- without `.env.local`, `/api/login` should continue to report backend-not-connected behaviour;
- local testing may use dry-run seed data only;
- no real student research data should be submitted from localhost.

Because Vite dev server does not automatically run Vercel API routes, the implementation plan should decide one of these local approaches:

1. use Vercel dev for API route testing;
2. keep Vite for frontend and test API routes separately;
3. add a tiny local API adapter only if needed.

Recommended first approach:

```text
Vite for frontend UI QA
Vercel dev for API route integration QA
```

## 11. Verification And QA Plan

Task 10 implementation should add deterministic checks for:

- `.env.example` exists and has no real values;
- `SUPABASE_SECRET_KEY` is not referenced in frontend files under `src/`;
- no `VITE_SUPABASE_*` variable is used;
- `.env.local` is ignored by git;
- API routes still return `supabase_not_connected` when backend is disabled;
- schema includes RLS enable statements;
- seed examples use only pseudonymous participant codes;
- build still passes.

Suggested commands:

```bash
npm run check:syntax
npm run check:stability
npm run check:backend-boundary
npm run check:login-ui
npm run check:supabase-env
npm run build
```

`check:supabase-env` should be introduced in the implementation plan.

## 12. Research Data Safety Gates

Before formal research use, the following gates must be satisfied:

1. Supabase project created for this study.
2. Environment variables configured in Vercel without exposing secrets to browser code.
3. Schema migration applied.
4. RLS enabled and grants/policies reviewed.
5. Dry-run participants inserted.
6. Test valid login creates one `game_sessions` row.
7. Excluded participant returns `invalid_or_excluded_participant`.
8. Missing code returns `missing_codes`.
9. Frontend stores only limited session object.
10. No real names or name-to-code mapping appear in Supabase.
11. Export / deletion / withdrawal procedure documented before real data collection.

## 13. Implementation Boundary For Next Plan

The next implementation plan should create or modify:

- `.env.example`;
- `docs/supabase-setup-checklist.md`;
- possibly `docs/supabase-seed-dryrun.sql`;
- `tests/supabase-env-check.mjs`;
- `package.json` script `check:supabase-env`;
- documentation references in `docs/research-id-map.md`;
- progress tracking files.

The next implementation plan should not yet:

- install `@supabase/supabase-js` unless the user explicitly approves moving from environment setup into dry-run connection;
- replace API stubs with live database writes;
- create real participant seed data;
- store any secret value in the repo.

## 14. Acceptance Criteria

Task 10 design is complete when:

- the connection remains server-side through Vercel API routes;
- `.env.example` variables are named but not valued;
- secret handling rules are explicit;
- frontend Supabase access is rejected for research writes;
- RLS/grants planning is included;
- dry-run seed data is pseudonymous;
- local vs Vercel development behaviour is documented;
- next implementation scope is bounded to environment setup and safety checks;
- no production research data collection is enabled by this design.

## 15. Open Decisions Before Live Connection

These decisions can remain open after Task 10 design, but must be resolved before live Supabase writes:

- Supabase project region;
- whether to use one project for dry-run and formal research or separate projects;
- whether to keep all tables in `public` or later move internal tables to a less exposed schema;
- exact RLS policy SQL;
- final participant seed import format;
- researcher export workflow;
- deletion / withdrawal workflow;
- whether focus group notes ever enter Supabase or remain outside the database.
