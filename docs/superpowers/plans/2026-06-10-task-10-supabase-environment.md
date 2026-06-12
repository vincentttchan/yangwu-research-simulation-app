# Task 10 Supabase Environment Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe Supabase environment setup documentation and deterministic checks without connecting live Supabase or storing secrets.

**Architecture:** Keep the current Vercel API stubs as the backend boundary. Add a checked-in `.env.example`, setup checklist, dry-run seed SQL, and a static `check:supabase-env` guard that proves secrets are not exposed to frontend code and no live Supabase writes are enabled.

**Tech Stack:** Vite app, Vercel API route conventions, Supabase PostgreSQL planning, vanilla Node checks, Markdown documentation, SQL seed documentation.

---

## Scope Boundary

Task 10 implements environment setup scaffolding only.

It must not:

- install `@supabase/supabase-js`;
- create a Supabase client;
- put a real Supabase URL or key in the repo;
- modify `api/login.js` or `api/logs-batch.js` to write to Supabase;
- change the login UI or gameplay flow;
- add `VITE_SUPABASE_*` variables;
- collect or seed student names, emails, phone numbers, school credentials, social logins, GPS, camera, microphone, screen recording, or name-to-code linkage;
- mark the app ready for formal research data collection.

Design source:

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/superpowers/specs/2026-06-10-task-10-supabase-environment-design.md`

## File Structure

Create:

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/.env.example`  
  Documents environment variable names only. No real values.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-setup-checklist.md`  
  Human-readable checklist for Supabase project creation, Vercel variables, migration order, RLS/grants posture, dry-run verification, and pre-research safety gates.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-seed-dryrun.sql`  
  Pseudonymous dry-run participant seed rows only.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/supabase-env-check.mjs`  
  Static check for environment setup safety.

Modify:

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/package.json`  
  Add `check:supabase-env`.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/research-id-map.md`  
  Add a short Task 10 note after the Task 9 login gate section.

- `/Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/task_plan.md`  
  Mark Task 10 implementation plan complete, and after execution mark Task 10 environment setup complete.

- `/Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/progress.md`  
  Add progress entries.

Do not commit automatically. The project has active uncommitted work; ask the user before committing.

---

### Task 1: Add Supabase Environment Failing Check

**Files:**
- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/supabase-env-check.mjs`
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/package.json`

- [ ] **Step 1: Create the failing environment check**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/supabase-env-check.mjs`:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const repoParent = join(root, '..');

const requiredFiles = {
  envExample: join(root, '.env.example'),
  setupChecklist: join(root, 'docs', 'supabase-setup-checklist.md'),
  dryRunSeed: join(root, 'docs', 'supabase-seed-dryrun.sql'),
  schema: join(root, 'docs', 'supabase-schema-v1.sql'),
  gitignore: join(repoParent, '.gitignore'),
  loginApi: join(root, 'api', 'login.js'),
  logsBatchApi: join(root, 'api', 'logs-batch.js')
};

Object.entries(requiredFiles).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const envExample = readFileSync(requiredFiles.envExample, 'utf8');
const setupChecklist = readFileSync(requiredFiles.setupChecklist, 'utf8');
const dryRunSeed = readFileSync(requiredFiles.dryRunSeed, 'utf8');
const schema = readFileSync(requiredFiles.schema, 'utf8');
const gitignore = readFileSync(requiredFiles.gitignore, 'utf8');
const loginApi = readFileSync(requiredFiles.loginApi, 'utf8');
const logsBatchApi = readFileSync(requiredFiles.logsBatchApi, 'utf8');

[
  'SUPABASE_URL=',
  'SUPABASE_SECRET_KEY=',
  'SUPABASE_SCHEMA=public',
  'RESEARCH_BACKEND_ENABLED=false',
  'RESEARCH_COHORT=lkkc-may-june-2026',
  'APP_VERSION=dev-v0.1'
].forEach((line) => {
  assert.match(envExample, new RegExp(`^${line}$`, 'm'), `.env.example should contain ${line}`);
});

assert.doesNotMatch(envExample, /https:\/\/[a-z0-9-]+\.supabase\.co/i, '.env.example should not contain a real Supabase URL');
assert.doesNotMatch(envExample, /sb_secret_/i, '.env.example should not contain a Supabase secret key');
assert.doesNotMatch(envExample, /eyJ[A-Za-z0-9_-]+\./, '.env.example should not contain JWT-like keys');
assert.doesNotMatch(envExample, /VITE_SUPABASE/i, '.env.example should not expose Supabase through Vite variables');

['.env', '.env.local', '.env.*.local', '.vercel'].forEach((needle) => {
  assert.match(gitignore, new RegExp(`(^|\\n)${needle.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(\\n|$)`), `.gitignore should ignore ${needle}`);
});

assert.match(setupChecklist, /server-only/i, 'Checklist should state server-only secret handling');
assert.match(setupChecklist, /Vercel environment variables/i, 'Checklist should cover Vercel environment variables');
assert.match(setupChecklist, /Row Level Security|RLS/, 'Checklist should cover RLS');
assert.match(setupChecklist, /grants/i, 'Checklist should cover grants');
assert.match(setupChecklist, /dry-run/i, 'Checklist should cover dry-run setup');
assert.match(setupChecklist, /withdrawal/i, 'Checklist should mention withdrawal/deletion workflow before formal use');
assert.match(setupChecklist, /not ready for formal research data collection/i, 'Checklist should state the environment is not ready for formal data collection yet');

assert.match(dryRunSeed, /YW-001/, 'Dry-run seed should include YW-001');
assert.match(dryRunSeed, /YW-002/, 'Dry-run seed should include YW-002');
assert.match(dryRunSeed, /YW-999/, 'Dry-run seed should include excluded test participant');
assert.match(dryRunSeed, /LKKC-2026-DRYRUN/, 'Dry-run seed should use dry-run session code');
assert.doesNotMatch(dryRunSeed, /@|email|phone|姓名|真名|student_id|name_to_code/i, 'Dry-run seed should not include personal identifiers');

[
  'alter table participants enable row level security',
  'alter table game_sessions enable row level security',
  'alter table event_logs enable row level security'
].forEach((needle) => {
  assert.match(schema, new RegExp(needle, 'i'), `Schema should include RLS statement: ${needle}`);
});

assert.match(loginApi, /supabase_not_connected/, 'Login API should remain disconnected in Task 10 environment setup');
assert.match(logsBatchApi, /supabase_not_connected/, 'Log batch API should remain disconnected in Task 10 environment setup');

function listFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') return [];
    if (entry.isDirectory()) return listFiles(fullPath);
    return [fullPath];
  });
}

const sourceFiles = listFiles(join(root, 'src')).concat([
  requiredFiles.loginApi,
  requiredFiles.logsBatchApi
]);

sourceFiles.forEach((file) => {
  const text = readFileSync(file, 'utf8');
  const rel = relative(root, file);
  assert.doesNotMatch(text, /VITE_SUPABASE/i, `${rel} should not use VITE_SUPABASE variables`);
});

listFiles(root).forEach((file) => {
  if (statSync(file).size > 1_000_000) return;
  const rel = relative(root, file);
  if (rel.startsWith('node_modules') || rel.startsWith('dist')) return;
  const text = readFileSync(file, 'utf8');
  assert.doesNotMatch(text, /sb_secret_[A-Za-z0-9_-]+/, `${rel} should not contain a Supabase secret key`);
  assert.doesNotMatch(text, /service_role[a-z0-9_.-]*\s*=\s*['"][^'"]+['"]/i, `${rel} should not contain a service role value`);
});

console.log('supabase environment checks passed');
```

- [ ] **Step 2: Add the package script**

Modify only the `scripts` object in `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/package.json` so it includes:

```json
"check:supabase-env": "node tests/supabase-env-check.mjs"
```

Place it after `check:login-ui`.

- [ ] **Step 3: Run the failing check**

Run:

```bash
npm run check:supabase-env
```

Expected: FAIL because `.env.example`, `docs/supabase-setup-checklist.md`, and `docs/supabase-seed-dryrun.sql` do not exist yet.

- [ ] **Step 4: Commit**

Commit only if the user explicitly approves commits. Otherwise skip.

```bash
git add package.json tests/supabase-env-check.mjs
git commit -m "test: add supabase environment guard"
```

---

### Task 2: Add Environment Example

**Files:**
- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/.env.example`
- Test: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/supabase-env-check.mjs`

- [ ] **Step 1: Create `.env.example`**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/.env.example`:

```text
# Supabase project URL. Example shape only; real value belongs in .env.local or Vercel.
SUPABASE_URL=

# Server-only Supabase secret key. Never expose this to browser code.
SUPABASE_SECRET_KEY=

# Current schema draft uses public tables.
SUPABASE_SCHEMA=public

# Keep disabled by default. Later values may be false, dry_run, or enabled after approval.
RESEARCH_BACKEND_ENABLED=false

# Planned research cohort marker.
RESEARCH_COHORT=lkkc-may-june-2026

# Current app baseline. Update only through the app versioning process.
APP_VERSION=dev-v0.1
```

- [ ] **Step 2: Run the environment check**

Run:

```bash
npm run check:supabase-env
```

Expected: FAIL because setup checklist and dry-run seed SQL do not exist yet.

- [ ] **Step 3: Commit**

Commit only if the user explicitly approves commits. Otherwise skip.

```bash
git add .env.example
git commit -m "docs: add supabase env example"
```

---

### Task 3: Add Supabase Setup Checklist

**Files:**
- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-setup-checklist.md`
- Test: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/supabase-env-check.mjs`

- [ ] **Step 1: Create setup checklist**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-setup-checklist.md`:

```md
# Supabase Setup Checklist

Status: environment setup only  
Research backend status: not ready for formal research data collection

## Purpose

This checklist prepares the Supabase environment for the Self-Strengthening Movement research version without enabling live research data collection. It supports the participant-code login model and future process-log submission through Vercel API routes.

## Server-Only Secret Handling

- Store `SUPABASE_SECRET_KEY` only in `.env.local` or Vercel environment variables.
- Do not put real Supabase keys in source control.
- Do not expose Supabase keys through `VITE_SUPABASE_*`.
- Do not create a browser Supabase client for research data writes.
- Do not log the full secret key. If a key fingerprint is ever needed, log only a safe hash or a short non-sensitive label.

## Vercel Environment Variables

Configure these variables in Vercel for Development, Preview, and Production:

| Variable | Development | Preview | Production | Notes |
|---|---:|---:|---:|---|
| `SUPABASE_URL` | yes | yes | yes | Project URL. |
| `SUPABASE_SECRET_KEY` | yes | yes | yes | Server-only. |
| `SUPABASE_SCHEMA` | yes | yes | yes | Start with `public`. |
| `RESEARCH_BACKEND_ENABLED` | `false` or `dry_run` | `dry_run` | `false` until research freeze | Do not enable production writes yet. |
| `RESEARCH_COHORT` | yes | yes | yes | `lkkc-may-june-2026`. |
| `APP_VERSION` | yes | yes | yes | Match app versioning process. |

## Supabase Project Setup

- Create a dedicated Supabase project for this study.
- Suggested project name: `yangwu-research-lkkc-2026`.
- Record the selected Supabase region in a private researcher setup note.
- Do not store the name-to-code matching list in Supabase.

## Migration Order

1. Apply `docs/supabase-schema-v1.sql`.
2. Review grants and default privileges.
3. Add Row Level Security (RLS) policies.
4. Insert dry-run seed data from `docs/supabase-seed-dryrun.sql`.
5. Test `POST /api/login` with dry-run participants.
6. Test excluded participant behaviour.
7. Test log submission only after login dry-run is stable.

## Row Level Security And Grants

- RLS is already enabled in `docs/supabase-schema-v1.sql`.
- Grants and RLS policies must be reviewed together.
- Do not grant broad `anon` access to research tables.
- Keep student browser access behind Vercel API routes.
- `participants` should be read by server route using `participant_code` and `session_code`.
- `game_sessions` should be inserted by server route after valid login.
- `event_logs` should be inserted later by server route after payload filtering.
- `research_scores`, `derived_indicators`, and `export_batches` are researcher/export paths, not student-browser paths.

## Dry-Run Data

- Use only pseudonymous participant codes.
- Use `LKKC-2026-DRYRUN` as the dry-run session code.
- Do not include student names, emails, phone numbers, school account IDs, or name-to-code linkage.
- Keep any real name-to-code matching list outside Supabase.

## Local Development

- Continue using Vite for frontend UI QA.
- Use Vercel dev or separate API route tests for API integration QA.
- Without `.env.local`, `/api/login` should continue to report backend-not-connected behaviour.
- No real student research data should be submitted from localhost.

## Before Formal Research Data Collection

The environment remains not ready for formal research data collection until all of the following are complete:

- Supabase project created for this study.
- Vercel environment variables configured without exposing secrets to browser code.
- Schema migration applied.
- Grants and RLS policies reviewed.
- Dry-run participants inserted.
- Valid dry-run login creates one `game_sessions` row.
- Excluded dry-run participant returns `invalid_or_excluded_participant`.
- Missing code returns `missing_codes`.
- Frontend stores only the limited research session object.
- Export workflow documented.
- Deletion / withdrawal workflow documented.

## References

- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase securing your API: https://supabase.com/docs/guides/api/securing-your-api
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
```

- [ ] **Step 2: Run the environment check**

Run:

```bash
npm run check:supabase-env
```

Expected: FAIL because dry-run seed SQL does not exist yet.

- [ ] **Step 3: Commit**

Commit only if the user explicitly approves commits. Otherwise skip.

```bash
git add docs/supabase-setup-checklist.md
git commit -m "docs: add supabase setup checklist"
```

---

### Task 4: Add Dry-Run Seed SQL

**Files:**
- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-seed-dryrun.sql`
- Test: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/supabase-env-check.mjs`

- [ ] **Step 1: Create dry-run seed SQL**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-seed-dryrun.sql`:

```sql
-- Dry-run seed data for Task 10 environment setup.
-- This file uses pseudonymous participant codes only.
-- Do not add student names, emails, phone numbers, school account IDs,
-- or name-to-code linkage to this file.

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
  ('YW-999', 'LKKC-2026-DRYRUN', 'LKKC-TEST', 'standard', 'excluded', 'dry-run excluded case')
on conflict (participant_code) do update set
  session_code = excluded.session_code,
  class_id = excluded.class_id,
  condition = excluded.condition,
  consent_status = excluded.consent_status,
  notes = excluded.notes;
```

- [ ] **Step 2: Run the environment check**

Run:

```bash
npm run check:supabase-env
```

Expected: PASS.

- [ ] **Step 3: Commit**

Commit only if the user explicitly approves commits. Otherwise skip.

```bash
git add docs/supabase-seed-dryrun.sql
git commit -m "docs: add supabase dry-run seed data"
```

---

### Task 5: Update Research Documentation

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/research-id-map.md`
- Modify: `/Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/task_plan.md`
- Modify: `/Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/progress.md`

- [ ] **Step 1: Update `docs/research-id-map.md`**

Add this section after `## Task 9 Research Login Gate`:

```md
## Task 10 Supabase Environment Setup

Task 10 prepares Supabase environment setup only. It does not connect live research data collection.

First implementation scope:

- adds `.env.example` without real values;
- adds Supabase setup checklist;
- adds pseudonymous dry-run seed SQL;
- adds `check:supabase-env`;
- keeps Supabase credentials server-side only;
- rejects `VITE_SUPABASE_*` research data writes;
- keeps `/api/login` and `/api/logs-batch` disconnected until a later approved dry-run connection sprint.
```

- [ ] **Step 2: Update workspace task plan**

In `/Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/task_plan.md`, ensure:

```md
28. [complete] Task 10 Supabase Connection / Environment Setup Design Spec
29. [complete] Task 10 Implementation Plan
```

After implementation later completes, add:

```md
30. [complete] Task 10 Supabase Environment Setup
```

- [ ] **Step 3: Update workspace progress log**

In `/Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/progress.md`, add:

```md
- 2026-06-10 補記：已完成 `Task 10 Implementation Plan`，輸出 `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/superpowers/plans/2026-06-10-task-10-supabase-environment.md`。計劃把 Task 10 實作範圍限制為 Supabase environment setup：新增 `.env.example`、`docs/supabase-setup-checklist.md`、`docs/supabase-seed-dryrun.sql`、`tests/supabase-env-check.mjs` 和 `check:supabase-env`，並更新研究文件。計劃明確不安裝 Supabase SDK、不填入真實 key、不使用 `VITE_SUPABASE_*` 作研究資料寫入、不把 `/api/login` 或 `/api/logs-batch` 改成正式 Supabase 寫入。
```

After implementation later completes, add:

```md
- 2026-06-10 補記：已完成 `Task 10 Supabase Environment Setup`。新增 `.env.example`、Supabase setup checklist、dry-run seed SQL 和 `check:supabase-env`，確認 secrets 不進 source control、frontend 不使用 `VITE_SUPABASE_*` 研究資料寫入、API stubs 仍保持 `supabase_not_connected`，正式 Supabase live connection 留待後續 dry-run connection sprint。
```

- [ ] **Step 4: Run documentation checks**

Run:

```bash
rg -n "Task 10 Supabase Environment Setup|check:supabase-env|VITE_SUPABASE|supabase_not_connected" docs/research-id-map.md /Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/task_plan.md /Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/progress.md
```

Expected: finds the Task 10 entries.

- [ ] **Step 5: Commit**

Commit only if the user explicitly approves commits. Otherwise skip.

```bash
git add docs/research-id-map.md /Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/task_plan.md /Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/progress.md
git commit -m "docs: update supabase environment setup progress"
```

---

### Task 6: Final Verification

**Files:**
- No additional file changes expected.

- [ ] **Step 1: Run full static checks**

Run:

```bash
npm run check:syntax
npm run check:stability
npm run check:backend-boundary
npm run check:research-map
npm run check:instrumentation
npm run check:assets
npm run check:login-ui
npm run check:supabase-env
npm run build
```

Expected: all PASS.

- [ ] **Step 2: Confirm API stubs remain disconnected**

Run:

```bash
rg -n "supabase_not_connected|@supabase/supabase-js|createClient|VITE_SUPABASE" api src tests docs package.json .env.example
```

Expected:

- `supabase_not_connected` appears in API stubs and docs/tests.
- `@supabase/supabase-js` does not appear as an installed dependency.
- `createClient` does not appear in app/API implementation.
- `VITE_SUPABASE` appears only in guard documentation/tests, not as an actual env variable used by app code.

- [ ] **Step 3: Commit**

Commit only if the user explicitly approves commits. Otherwise skip.

```bash
git status --short
```

Expected: shows Task 10 files plus existing uncommitted Task 9/Task 10 spec work. Do not commit unless explicitly instructed.

---

## Final Verification Gate

Before reporting Task 10 environment setup complete, run:

```bash
npm run check:syntax
npm run check:stability
npm run check:backend-boundary
npm run check:research-map
npm run check:instrumentation
npm run check:assets
npm run check:login-ui
npm run check:supabase-env
npm run build
```

Then disclose that no live Supabase connection has been enabled.

## Self-Review Checklist

- Spec coverage:
  - `.env.example`: Task 2.
  - Vercel env checklist: Task 3.
  - server-only secret policy: Task 3 and Task 1 checks.
  - RLS/grants planning: Task 3 and Task 1 checks.
  - dry-run seed data: Task 4.
  - no live connection: Task 1, Task 3, Task 6.
  - no frontend Supabase credentials: Task 1 and Task 6.
  - documentation updates: Task 5.

- Completion scan:
  - No open markers or vague implementation steps.

- Type/name consistency:
  - `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_SCHEMA`, `RESEARCH_BACKEND_ENABLED`, `RESEARCH_COHORT`, and `APP_VERSION` match the Task 10 design spec.
  - `check:supabase-env` maps to `node tests/supabase-env-check.mjs`.
