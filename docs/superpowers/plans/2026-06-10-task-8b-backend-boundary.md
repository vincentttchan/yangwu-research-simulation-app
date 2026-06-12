# Task 8B Backend Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the backend boundary for participant-code login and research-log submission without connecting Supabase or changing the visible game UI.

**Architecture:** Keep the Vite game frontend intact. Add Vercel API route stubs, a frontend session helper, a frontend API helper, a Supabase schema draft, and deterministic checks. The implementation should make the future Supabase connection straightforward while keeping Task 8B safe, testable, and non-invasive.

**Tech Stack:** Vite, vanilla JavaScript ES modules, Vercel API routes, future Supabase PostgreSQL, Node-based repository checks.

---

## Scope Boundary

Task 8B implements only the backend boundary and schema draft.

It must not:

- connect to Supabase;
- install `@supabase/supabase-js`;
- create a login screen;
- block the current game behind login;
- submit real research data;
- change visible gameplay or UI;
- collect student real names, emails, phone numbers, school credentials, GPS, webcam, microphone, screen recording, or name-to-code mapping.

The active design source is:

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/superpowers/specs/2026-06-10-task-8-login-supabase-design.md`

## File Structure

Create:

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/api/login.js`  
  Vercel API stub for participant-code login. Returns `501 supabase_not_connected` for POST until the Supabase sprint.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/api/logs-batch.js`  
  Vercel API stub for queued event-log submission. Returns `501 supabase_not_connected` for POST until the Supabase sprint.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/research/session.js`  
  Browser session helper using `sessionStorage`, not `localStorage`, for the current research session object.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/research/api.js`  
  Frontend helper for future login and batch submission calls. It is not imported into `main.js` until a visible login/submission flow exists.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-schema-v1.sql`  
  Schema draft based on the Task 8A research-cycle revision, including intervention fidelity, complexity dimensions, derived indicators, instrument versioning, and rubric versioning.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/research-backend-boundary-check.mjs`  
  Static and runtime checks for API stubs, frontend helpers, session storage, and schema keywords.

Modify:

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/package.json`  
  Add `check:backend-boundary`.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/main.js`  
  Import `./research/session.js` after local logger modules, so QA hooks and session marker load early. Do not import `api.js`.

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/stability-checks.mjs`  
  Add guard checks for session helper import and backend boundary files.

Do not commit automatically. The project has active uncommitted work; ask the user before committing.

---

### Task 1: Add Backend Boundary Failing Checks

**Files:**

- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/research-backend-boundary-check.mjs`
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/package.json`

- [ ] **Step 1: Create the failing backend-boundary check**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/research-backend-boundary-check.mjs`:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  loginApi: join(root, 'api', 'login.js'),
  logsBatchApi: join(root, 'api', 'logs-batch.js'),
  session: join(root, 'src', 'research', 'session.js'),
  frontendApi: join(root, 'src', 'research', 'api.js'),
  schema: join(root, 'docs', 'supabase-schema-v1.sql'),
  main: join(root, 'src', 'main.js')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const loginApi = readFileSync(files.loginApi, 'utf8');
const logsBatchApi = readFileSync(files.logsBatchApi, 'utf8');
const session = readFileSync(files.session, 'utf8');
const frontendApi = readFileSync(files.frontendApi, 'utf8');
const schema = readFileSync(files.schema, 'utf8');
const main = readFileSync(files.main, 'utf8');

assert.match(loginApi, /supabase_not_connected/, 'Login API should remain a Supabase-disconnected stub in Task 8B');
assert.match(loginApi, /participant_code/, 'Login API should name participant_code');
assert.match(loginApi, /session_code/, 'Login API should name session_code');
assert.match(logsBatchApi, /supabase_not_connected/, 'Log batch API should remain a Supabase-disconnected stub in Task 8B');
assert.match(logsBatchApi, /events/, 'Log batch API should name events');
assert.match(logsBatchApi, /session/, 'Log batch API should name session');

assert.match(session, /yangwu_research_session_v1/, 'Research session should use a dedicated sessionStorage key');
assert.match(session, /sessionStorage/, 'Research session should use sessionStorage, not localStorage');
assert.match(session, /window\.__researchSession/, 'Research session should expose a QA hook');
assert.match(session, /document\.documentElement\.dataset\.researchSession\s*=\s*'session-v1'/, 'Research session should expose a browser marker');

assert.match(frontendApi, /\/api\/login/, 'Frontend API helper should target login API');
assert.match(frontendApi, /\/api\/logs-batch/, 'Frontend API helper should target log batch API');
assert.match(frontendApi, /participant_code/, 'Frontend API helper should submit participant_code');
assert.match(frontendApi, /session_code/, 'Frontend API helper should submit session_code');
assert.match(frontendApi, /app_version/, 'Frontend API helper should include app_version for login');
assert.match(frontendApi, /research_cohort/, 'Frontend API helper should include research_cohort for login');

[
  'create table participants',
  'create table intervention_runs',
  'create table game_sessions',
  'create table event_logs',
  'create table checkpoint_responses',
  'create table assessment_responses',
  'create table research_scores',
  'create table derived_indicators',
  'create table export_batches',
  'complexity_dimensions',
  'instrument_version',
  'rubric_version',
  'derivation_version'
].forEach((needle) => {
  assert.match(schema, new RegExp(needle), `Schema should include ${needle}`);
});

assert.match(main, /import '\.\/research\/session\.js';/, 'main.js should load research session helper before game code');
assert.doesNotMatch(main, /import '\.\/research\/api\.js';/, 'main.js should not import API helper until login/submission UI exists');

const store = new Map();
globalThis.window = {};
globalThis.document = { documentElement: { dataset: {} } };
globalThis.sessionStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  setItem(key, value) {
    store.set(key, String(value));
  },
  removeItem(key) {
    store.delete(key);
  }
};

const sessionModule = await import('../src/research/session.js?backend-boundary-test=' + Date.now());
sessionModule.saveResearchSession({
  session_id: 'session-test',
  participant_code: 'YW-001',
  class_id: 'LKKC-S4A',
  condition: 'scaffolded',
  app_version: 'dev-v0.1',
  research_cohort: 'lkkc-may-june-2026'
});
assert.equal(sessionModule.loadResearchSession().session_id, 'session-test');
sessionModule.clearResearchSession();
assert.equal(sessionModule.loadResearchSession(), null);
assert.equal(document.documentElement.dataset.researchSession, 'session-v1');

console.log('research backend boundary checks passed');
```

- [ ] **Step 2: Add the package script**

Modify `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/package.json`:

```json
"check:backend-boundary": "node tests/research-backend-boundary-check.mjs"
```

Place it after `check:instrumentation`.

- [ ] **Step 3: Run the failing check**

Run:

```bash
npm run check:backend-boundary
```

Expected: FAIL because API files, session helper, frontend API helper, and schema draft do not exist yet.

---

### Task 2: Add Vercel API Stubs

**Files:**

- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/api/login.js`
- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/api/logs-batch.js`

- [ ] **Step 1: Create login API stub**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/api/login.js`:

```js
export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { participant_code, session_code, app_version, research_cohort, device } = request.body || {};

  if (!participant_code || !session_code) {
    response.status(400).json({ error: 'missing_codes' });
    return;
  }

  response.status(501).json({
    error: 'supabase_not_connected',
    message: 'Login API shape is prepared; Supabase validation is added in the backend connection sprint.',
    accepted_shape: {
      participant_code,
      session_code,
      app_version: app_version || null,
      research_cohort: research_cohort || null,
      device: device || null
    }
  });
}
```

- [ ] **Step 2: Create log batch API stub**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/api/logs-batch.js`:

```js
export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { session, events } = request.body || {};

  if (!session?.session_id || !session?.participant_code || !Array.isArray(events)) {
    response.status(400).json({ error: 'invalid_log_batch' });
    return;
  }

  response.status(501).json({
    error: 'supabase_not_connected',
    message: 'Log batch API shape is prepared; Supabase insert is added in the backend connection sprint.',
    accepted_shape: {
      session_id: session.session_id,
      participant_code: session.participant_code,
      event_count: events.length
    }
  });
}
```

- [ ] **Step 3: Run syntax checks for API stubs**

Run:

```bash
node --check api/login.js && node --check api/logs-batch.js
```

Expected: PASS.

---

### Task 3: Add Research Session Helper

**Files:**

- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/research/session.js`
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/main.js`

- [ ] **Step 1: Create session helper**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/research/session.js`:

```js
const SESSION_KEY = 'yangwu_research_session_v1';

function compactSession(session) {
  if (!session || typeof session !== 'object') return null;
  return {
    session_id: session.session_id || null,
    participant_code: session.participant_code || null,
    class_id: session.class_id || null,
    condition: session.condition || null,
    app_version: session.app_version || null,
    research_cohort: session.research_cohort || null,
    content_map_version: session.content_map_version || null
  };
}

export function saveResearchSession(session) {
  const compact = compactSession(session);
  if (!compact?.session_id || !compact?.participant_code) return null;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(compact));
  return compact;
}

export function loadResearchSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch (error) {
    return null;
  }
}

export function clearResearchSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

window.__researchSession = {
  save: saveResearchSession,
  load: loadResearchSession,
  clear: clearResearchSession
};

document.documentElement.dataset.researchSession = 'session-v1';
document.documentElement.dataset.researchSessionKey = SESSION_KEY;
```

- [ ] **Step 2: Import session helper in main entry**

Modify `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/main.js`:

```js
import './research/version.js';
import './research/event-taxonomy.js';
import './research/content-map.js';
import './research/logger.js';
import './research/instrumentation.js';
import './research/session.js';
import './style-explore.css';
import './motion.js';
import './intro.js';
```

- [ ] **Step 3: Run backend-boundary check**

Run:

```bash
npm run check:backend-boundary
```

Expected: still FAIL because `src/research/api.js` and `docs/supabase-schema-v1.sql` do not exist yet.

---

### Task 4: Add Frontend API Helper Without Importing It

**Files:**

- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/research/api.js`

- [ ] **Step 1: Create frontend API helper**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/research/api.js`:

```js
import { APP_VERSION, RESEARCH_COHORT } from './version.js';
import { RESEARCH_ID_POLICY } from './content-map.js';

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function getDeviceSnapshot() {
  const width = window.innerWidth || 0;
  const height = window.innerHeight || 0;
  let category = 'desktop';
  if (width <= 700) category = 'mobile';
  else if (width <= 1100) category = 'tablet';

  return {
    category,
    viewport_width: width,
    viewport_height: height,
    browser_family: navigator.userAgentData?.brands?.[0]?.brand || null
  };
}

export function loginWithParticipantCode(participantCode, sessionCode) {
  return postJson('/api/login', {
    participant_code: String(participantCode || '').trim(),
    session_code: String(sessionCode || '').trim(),
    app_version: APP_VERSION,
    research_cohort: RESEARCH_COHORT,
    content_map_version: RESEARCH_ID_POLICY.version,
    device: getDeviceSnapshot()
  });
}

export function submitLogBatch(events, session) {
  return postJson('/api/logs-batch', {
    session,
    events
  });
}

export const __researchApiForTests = {
  postJson,
  getDeviceSnapshot
};
```

- [ ] **Step 2: Confirm main entry does not import API helper**

Run:

```bash
rg "research/api" src/main.js
```

Expected: no matches.

- [ ] **Step 3: Run backend-boundary check**

Run:

```bash
npm run check:backend-boundary
```

Expected: still FAIL because `docs/supabase-schema-v1.sql` does not exist yet.

---

### Task 5: Add Supabase Schema Draft

**Files:**

- Create: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-schema-v1.sql`

- [ ] **Step 1: Create schema draft**

Create `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/supabase-schema-v1.sql`:

```sql
create table participants (
  participant_code text primary key,
  session_code text not null,
  class_id text not null,
  condition text not null check (condition in ('standard', 'scaffolded')),
  consent_status text not null check (consent_status in ('included', 'excluded', 'withdrawn')),
  created_at timestamptz not null default now(),
  notes text
);

create table intervention_runs (
  intervention_run_id uuid primary key default gen_random_uuid(),
  class_id text not null,
  condition text not null check (condition in ('standard', 'scaffolded')),
  run_date date not null,
  school_code text not null default 'LKKC',
  app_version text not null,
  research_cohort text not null,
  content_map_version text,
  planned_duration_minutes integer,
  actual_duration_minutes integer,
  teacher_debrief_completed boolean not null default false,
  implementation_status text not null default 'planned',
  fidelity_notes text
);

create table game_sessions (
  session_id uuid primary key default gen_random_uuid(),
  participant_code text not null references participants(participant_code),
  intervention_run_id uuid references intervention_runs(intervention_run_id),
  app_version text not null,
  research_cohort text not null,
  content_map_version text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  device_category text,
  viewport_width integer,
  viewport_height integer,
  browser_family text,
  completion_status text not null default 'started'
);

create table event_logs (
  log_id uuid primary key default gen_random_uuid(),
  client_event_id text unique,
  session_id uuid not null references game_sessions(session_id),
  participant_code text not null references participants(participant_code),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  constructs text[] not null default '{}',
  complexity_dimensions text[] not null default '{}',
  client_time timestamptz,
  server_time timestamptz not null default now(),
  app_version text not null,
  research_cohort text not null,
  content_map_version text
);

create table checkpoint_responses (
  response_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(session_id),
  participant_code text not null references participants(participant_code),
  condition text not null check (condition in ('standard', 'scaffolded')),
  checkpoint_id text not null,
  event_id text,
  city_id text,
  prompt_id text,
  constructs text[] not null default '{}',
  complexity_dimensions text[] not null default '{}',
  response_text text not null,
  response_length integer,
  submitted_at timestamptz not null default now(),
  app_version text not null,
  research_cohort text not null,
  content_map_version text
);

create table assessment_responses (
  response_id uuid primary key default gen_random_uuid(),
  participant_code text not null references participants(participant_code),
  session_id uuid references game_sessions(session_id),
  instrument text not null,
  phase text not null check (phase in ('pre', 'post', 'during')),
  item_id text,
  response_text text,
  response_json jsonb,
  submitted_at timestamptz not null default now(),
  app_version text not null,
  research_cohort text not null,
  instrument_version text
);

create table research_scores (
  score_id uuid primary key default gen_random_uuid(),
  participant_code text not null references participants(participant_code),
  response_id uuid references assessment_responses(response_id),
  instrument text not null,
  dimension text not null,
  score numeric not null,
  coder_id text not null,
  rubric_version text not null,
  coded_at timestamptz not null default now(),
  notes text
);

create table derived_indicators (
  indicator_id uuid primary key default gen_random_uuid(),
  participant_code text not null references participants(participant_code),
  session_id uuid references game_sessions(session_id),
  indicator_name text not null,
  indicator_value numeric,
  indicator_json jsonb,
  derivation_version text not null,
  created_at timestamptz not null default now(),
  notes text
);

create table export_batches (
  export_id uuid primary key default gen_random_uuid(),
  export_type text not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  app_version_filter text,
  research_cohort_filter text,
  file_path text,
  notes text
);

alter table participants enable row level security;
alter table intervention_runs enable row level security;
alter table game_sessions enable row level security;
alter table event_logs enable row level security;
alter table checkpoint_responses enable row level security;
alter table assessment_responses enable row level security;
alter table research_scores enable row level security;
alter table derived_indicators enable row level security;
alter table export_batches enable row level security;
```

- [ ] **Step 2: Run backend-boundary check**

Run:

```bash
npm run check:backend-boundary
```

Expected: PASS.

---

### Task 6: Extend Stability Checks For Backend Boundary

**Files:**

- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/stability-checks.mjs`

- [ ] **Step 1: Add file reads**

Near the existing research file reads, add:

```js
const session = readFileSync(join(root, 'src', 'research', 'session.js'), 'utf8');
const backendApi = readFileSync(join(root, 'src', 'research', 'api.js'), 'utf8');
const backendSchema = readFileSync(join(root, 'docs', 'supabase-schema-v1.sql'), 'utf8');
```

- [ ] **Step 2: Add assertions near the existing research assertions**

Add:

```js
assert.match(main, /import '\.\/research\/session\.js';/, 'main.js should load research session helper before game code');
assert.doesNotMatch(main, /import '\.\/research\/api\.js';/, 'main.js should not import backend API helper before login/submission UI exists');
assert.match(session, /yangwu_research_session_v1/, 'Research session should use a dedicated sessionStorage key');
assert.match(session, /sessionStorage/, 'Research session should use sessionStorage for current browser session state');
assert.match(session, /window\.__researchSession/, 'Research session should expose a QA hook');
assert.match(backendApi, /\/api\/login/, 'Research API helper should target login route');
assert.match(backendApi, /\/api\/logs-batch/, 'Research API helper should target log batch route');
assert.match(backendSchema, /create table intervention_runs/, 'Schema should include intervention fidelity layer');
assert.match(backendSchema, /complexity_dimensions/, 'Schema should include historical complexity dimensions');
assert.match(backendSchema, /create table derived_indicators/, 'Schema should include analysis-ready derived indicators');
assert.match(backendSchema, /rubric_version/, 'Schema should include rubric versioning');
assert.match(backendSchema, /instrument_version/, 'Schema should include instrument versioning');
```

- [ ] **Step 3: Run stability checks**

Run:

```bash
npm run check:stability
```

Expected: PASS.

---

### Task 7: Final Verification

**Files:**

- No new files.

- [ ] **Step 1: Run syntax checks**

Run:

```bash
npm run check:syntax && node --check api/login.js && node --check api/logs-batch.js && node --check src/research/session.js && node --check src/research/api.js
```

Expected: PASS.

- [ ] **Step 2: Run research checks**

Run:

```bash
npm run check:stability && npm run check:research-map && npm run check:instrumentation && npm run check:backend-boundary
```

Expected: PASS.

- [ ] **Step 3: Run asset and production build checks**

Run:

```bash
npm run check:assets && npm run build
```

Expected: PASS.

- [ ] **Step 4: Browser marker check**

If the dev server is running at `http://localhost:5173/`, reload the page and verify:

```js
document.documentElement.dataset.researchSession === 'session-v1'
document.documentElement.dataset.researchLogger === 'local-v1'
document.documentElement.dataset.researchInstrumentation === 'local-flow-v1'
document.documentElement.dataset.researchContentMap === 'content-freeze-lite-v0.1'
```

Expected: all true, with no console warning/error.

---

## Self-Review Checklist

- Spec coverage: Task 8A requirements are mapped to stubs, session helper, API helper, schema draft, tests, and export-ready schema fields.
- Scope control: no visible login screen, no Supabase client, no real submission, no UI changes.
- Data minimisation: no real names, email, phone, social login, GPS, webcam, microphone, screen recording, school credentials, or name-to-code list.
- Research alignment: schema includes intervention fidelity, complexity dimensions, derived indicators, instrument versioning, and rubric versioning.
- Execution boundary: do not commit unless the user explicitly asks.

