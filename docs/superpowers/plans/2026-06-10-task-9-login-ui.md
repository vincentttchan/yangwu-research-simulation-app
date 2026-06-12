# Task 9 Login UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a research-only login gate that appears only with `?mode=research`, collects only participant code and session code, and preserves the normal development game flow.

**Architecture:** Add a small side-effect module `src/research/login-gate.js` imported by `src/main.js`. The module exits immediately unless the URL contains `?mode=research`; when active, it creates an accessible overlay, validates two fields, dynamically calls the existing `/api/login` helper only on submit, and saves the limited session object through `src/research/session.js` only on successful login. Copy, mode detection, and error messages stay inside focused constants so later wording and visual polish remain easy to change.

**Tech Stack:** Vite ES modules, browser DOM APIs, existing research helpers, `sessionStorage`, existing Node-based static checks, CSS in `src/style-explore.css`.

---

## File Structure

- Create `src/research/login-gate.js`
  - Owns mode detection, DOM creation, validation, error display, success session saving, and QA markers.
  - Must not collect personal identifiers beyond `participant_code` and `session_code`.
  - Must not submit gameplay logs.
  - Must use dynamic `import('./api.js')` only when the user submits the form.

- Modify `src/main.js`
  - Import `./research/login-gate.js` after `./research/session.js` and before visual/game modules.
  - Do not import `./research/api.js` directly.

- Modify `src/style-explore.css`
  - Add a focused `Research Login Gate` section.
  - Keep styles independent from event modal, map, or intro redesign work.
  - Use existing color/font tokens and introduce only one z-index token if needed.

- Create `tests/research-login-ui-check.mjs`
  - Static guard for mode trigger, approved fields, forbidden fields, copy, dynamic API import, `sessionStorage` session helper use, and main import.

- Modify `tests/stability-checks.mjs`
  - Add guard that `main.js` imports login gate.
  - Keep guard that `main.js` does not reference `research/api.js`.

- Modify `tests/research-backend-boundary-check.mjs`
  - Add `loginGate` to file existence checks.
  - Confirm `login-gate.js` uses the API helper instead of allowing direct API import from `main.js`.

- Modify `package.json`
  - Add `check:login-ui`.
  - Extend `check:syntax` to include `src/research/login-gate.js`.

## Implementation Principles

- The implementation is allowed before final UI copy polish because copy lives in one constant object.
- Do not connect Supabase.
- Do not add real participant validation.
- Do not add password, email, phone, school-account, social-login, name, student-ID, location, camera, microphone, or screen-recording fields.
- Do not alter the existing opening screen markup unless a future UI polish sprint chooses to.
- The formal research URL is the only login trigger: `?mode=research`.
- The normal development URL remains playable: `http://localhost:5173/`.
- `?mode=dev` bypasses the research gate.

---

### Task 1: Add Failing Login UI Static Check

**Files:**
- Create: `tests/research-login-ui-check.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the failing test file**

Create `tests/research-login-ui-check.mjs` with this complete content:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  loginGate: join(root, 'src', 'research', 'login-gate.js'),
  main: join(root, 'src', 'main.js'),
  css: join(root, 'src', 'style-explore.css')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const loginGate = readFileSync(files.loginGate, 'utf8');
const main = readFileSync(files.main, 'utf8');
const css = readFileSync(files.css, 'utf8');

assert.match(loginGate, /MODE_RESEARCH\s*=\s*'research'/, 'Login gate should define research mode explicitly');
assert.match(loginGate, /MODE_DEV\s*=\s*'dev'/, 'Login gate should define dev mode explicitly');
assert.match(loginGate, /URLSearchParams\(window\.location\.search\)/, 'Login gate should read URL mode from query string');
assert.match(loginGate, /mode.*MODE_RESEARCH/s, 'Login gate should only activate for research mode');
assert.match(loginGate, /mode.*MODE_DEV/s, 'Login gate should support explicit dev bypass');

assert.match(loginGate, /participant_code/g, 'Login gate should submit participant_code');
assert.match(loginGate, /session_code/g, 'Login gate should submit session_code');
assert.match(loginGate, /參與代碼/, 'Login gate should show participant code label');
assert.match(loginGate, /課節代碼/, 'Login gate should show session code label');
assert.match(loginGate, /研究登入/, 'Login gate should show research login heading');
assert.match(loginGate, /請勿輸入真實姓名。/, 'Login gate should warn students not to enter real names');
assert.match(loginGate, /進入研究版本/, 'Login gate should show research entry button copy');
assert.match(loginGate, /開發試玩/, 'Login gate should include localhost-only development bypass copy');

[
  'email',
  'phone',
  'password',
  'social',
  'student_id',
  'camera',
  'microphone',
  'screen recording',
  '真實姓名.*input',
  '姓名.*input'
].forEach((forbidden) => {
  assert.doesNotMatch(loginGate, new RegExp(forbidden, 'i'), `Login gate should not include forbidden field or collection pattern: ${forbidden}`);
});

assert.match(loginGate, /import\(['"]\.\/api\.js['"]\)/, 'Login gate should dynamically import API helper only when needed');
assert.doesNotMatch(loginGate, /import\s+\{[^}]*loginWithParticipantCode[^}]*\}\s+from\s+['"]\.\/api\.js['"]/, 'Login gate should not statically import API helper');
assert.match(loginGate, /saveResearchSession/, 'Login gate should save successful limited session through session helper');
assert.match(loginGate, /loadResearchSession/, 'Login gate should detect an existing session');
assert.match(loginGate, /supabase_not_connected/, 'Login gate should handle backend-not-connected stub state');
assert.match(loginGate, /invalid_or_excluded_participant/, 'Login gate should handle invalid/excluded participant state');
assert.match(loginGate, /暫時未能連接登入服務/, 'Login gate should handle network errors with student-facing copy');

assert.match(main, /import '\.\/research\/login-gate\.js';/, 'main.js should load research login gate module');
assert.doesNotMatch(main, /research\/api\.js/, 'main.js should not import or reference research API helper directly');

assert.match(css, /Research Login Gate/, 'CSS should include a named research login gate section');
assert.match(css, /\.research-login-gate/, 'CSS should style the research login gate');
assert.match(css, /\.research-login-panel/, 'CSS should style the research login panel');
assert.match(css, /@media \(max-width:\s*700px\)[\s\S]*\.research-login-panel/, 'CSS should include mobile layout protection for the login panel');
assert.match(css, /min-height:\s*44px/, 'Login controls should keep comfortable touch targets');

console.log('research login UI checks passed');
```

- [ ] **Step 2: Add the npm script**

Modify `package.json` scripts so the scripts block includes `check:login-ui` and syntax includes the future file:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0",
    "check:syntax": "node --check src/intro.js && node --check src/motion.js && node --check src/main.js && node --check src/research/login-gate.js",
    "check:stability": "node tests/stability-checks.mjs",
    "check:assets": "node tests/asset-reference-check.mjs",
    "check:research-map": "node tests/research-content-map-check.mjs",
    "check:instrumentation": "node tests/research-instrumentation-check.mjs",
    "check:backend-boundary": "node tests/research-backend-boundary-check.mjs",
    "check:login-ui": "node tests/research-login-ui-check.mjs"
  }
}
```

Only change the `scripts` object; keep existing package metadata and dependencies unchanged.

- [ ] **Step 3: Run the new check to verify it fails**

Run:

```bash
npm run check:login-ui
```

Expected: FAIL because `src/research/login-gate.js` does not exist yet.

- [ ] **Step 4: Run syntax check to verify the new script fails for the same reason**

Run:

```bash
npm run check:syntax
```

Expected: FAIL because `src/research/login-gate.js` does not exist yet.

- [ ] **Step 5: Commit**

Commit only if the user has explicitly approved commits for this sprint. Otherwise skip this step and leave changes uncommitted.

```bash
git add package.json tests/research-login-ui-check.mjs
git commit -m "test: add research login ui guards"
```

---

### Task 2: Implement Login Gate Module

**Files:**
- Create: `src/research/login-gate.js`
- Test: `tests/research-login-ui-check.mjs`

- [ ] **Step 1: Create `src/research/login-gate.js`**

Create `src/research/login-gate.js` with this complete content:

```js
import { loadResearchSession, saveResearchSession } from './session.js';

const MODE_RESEARCH = 'research';
const MODE_DEV = 'dev';

const COPY = {
  heading: '研究登入',
  support: '請輸入老師或研究員提供的參與代碼與課節代碼。',
  privacy: '請勿輸入真實姓名。',
  participantLabel: '參與代碼',
  sessionLabel: '課節代碼',
  submit: '進入研究版本',
  devBypass: '開發試玩',
  missingCodes: '請輸入參與代碼及課節代碼。',
  invalidCode: '代碼未能確認。請檢查輸入，或向老師／研究員查詢。',
  backendNotConnected: '研究登入尚未連接後台。現在仍可作開發測試。',
  networkError: '暫時未能連接登入服務。請稍後再試，或通知老師／研究員。',
  returning: '已偵測到本課節的研究登入，可繼續進入。'
};

function getMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') || '';
}

function isLocalhost() {
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

function setMarker(state) {
  document.documentElement.dataset.researchLoginGate = state;
}

function createField(id, label, autocomplete) {
  const wrap = document.createElement('label');
  wrap.className = 'research-login-field';
  wrap.setAttribute('for', id);

  const labelText = document.createElement('span');
  labelText.className = 'research-login-label';
  labelText.textContent = label;

  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = 'text';
  input.inputMode = 'text';
  input.autocomplete = autocomplete;
  input.spellcheck = false;
  input.className = 'research-login-input';

  wrap.append(labelText, input);
  return { wrap, input };
}

function setMessage(node, message, tone = 'neutral') {
  node.textContent = message || '';
  node.dataset.tone = tone;
  node.hidden = !message;
}

function closeGate(gate) {
  gate.setAttribute('hidden', '');
  gate.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-research-login-gate');
  setMarker('passed');
}

function focusFirstEmpty(participantInput, sessionInput) {
  const target = !participantInput.value.trim() ? participantInput : sessionInput;
  window.setTimeout(() => target.focus(), 0);
}

async function submitLogin({ participantInput, sessionInput, messageNode, gate, submitButton }) {
  const participantCode = participantInput.value.trim();
  const sessionCode = sessionInput.value.trim();

  if (!participantCode || !sessionCode) {
    setMessage(messageNode, COPY.missingCodes, 'error');
    focusFirstEmpty(participantInput, sessionInput);
    return;
  }

  submitButton.disabled = true;
  setMessage(messageNode, '', 'neutral');

  try {
    const { loginWithParticipantCode } = await import('./api.js');
    const result = await loginWithParticipantCode(participantCode, sessionCode);

    if (result.ok && result.data?.session) {
      const saved = saveResearchSession(result.data.session);
      if (saved) closeGate(gate);
      else setMessage(messageNode, COPY.networkError, 'error');
      return;
    }

    const error = result.data?.error;
    if (error === 'missing_codes') {
      setMessage(messageNode, COPY.missingCodes, 'error');
      focusFirstEmpty(participantInput, sessionInput);
      return;
    }

    if (error === 'invalid_or_excluded_participant') {
      setMessage(messageNode, COPY.invalidCode, 'error');
      return;
    }

    if (error === 'supabase_not_connected') {
      setMessage(messageNode, COPY.backendNotConnected, 'warning');
      return;
    }

    setMessage(messageNode, COPY.networkError, 'error');
  } catch (error) {
    setMessage(messageNode, COPY.networkError, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

function renderGate() {
  const existingSession = loadResearchSession();
  const gate = document.createElement('section');
  gate.className = 'research-login-gate';
  gate.setAttribute('role', 'dialog');
  gate.setAttribute('aria-modal', 'true');
  gate.setAttribute('aria-labelledby', 'researchLoginHeading');

  const panel = document.createElement('form');
  panel.className = 'research-login-panel';
  panel.noValidate = true;

  const eyebrow = document.createElement('p');
  eyebrow.className = 'research-login-eyebrow';
  eyebrow.textContent = 'Self-Strengthening Movement Study';

  const heading = document.createElement('h2');
  heading.id = 'researchLoginHeading';
  heading.className = 'research-login-heading';
  heading.textContent = COPY.heading;

  const support = document.createElement('p');
  support.className = 'research-login-copy';
  support.textContent = COPY.support;

  const privacy = document.createElement('p');
  privacy.className = 'research-login-privacy';
  privacy.textContent = COPY.privacy;

  const participant = createField('participant_code', COPY.participantLabel, 'off');
  const session = createField('session_code', COPY.sessionLabel, 'off');

  const message = document.createElement('p');
  message.className = 'research-login-message';
  message.setAttribute('aria-live', 'polite');
  message.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'research-login-actions';

  const submit = document.createElement('button');
  submit.className = 'research-login-submit';
  submit.type = 'submit';
  submit.textContent = COPY.submit;

  actions.append(submit);

  if (isLocalhost()) {
    const bypass = document.createElement('button');
    bypass.className = 'research-login-bypass';
    bypass.type = 'button';
    bypass.textContent = COPY.devBypass;
    bypass.addEventListener('click', () => closeGate(gate));
    actions.append(bypass);
  }

  panel.append(
    eyebrow,
    heading,
    support,
    privacy,
    participant.wrap,
    session.wrap,
    message,
    actions
  );
  gate.append(panel);
  document.body.append(gate);

  document.body.classList.add('has-research-login-gate');
  setMarker(existingSession ? 'returning' : 'visible');

  if (existingSession) {
    setMessage(message, COPY.returning, 'neutral');
  }

  panel.addEventListener('submit', (event) => {
    event.preventDefault();
    submitLogin({
      participantInput: participant.input,
      sessionInput: session.input,
      messageNode: message,
      gate,
      submitButton: submit
    });
  });

  window.setTimeout(() => participant.input.focus(), 0);
}

function initResearchLoginGate() {
  const mode = getMode();
  if (mode === MODE_DEV) {
    setMarker('dev-bypass');
    return;
  }

  if (mode !== MODE_RESEARCH) {
    setMarker('inactive');
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderGate, { once: true });
  } else {
    renderGate();
  }
}

initResearchLoginGate();

export const __researchLoginGateForTests = {
  MODE_RESEARCH,
  MODE_DEV,
  COPY,
  getMode,
  isLocalhost
};
```

- [ ] **Step 2: Run syntax check for the new module**

Run:

```bash
node --check src/research/login-gate.js
```

Expected: PASS.

- [ ] **Step 3: Run login UI check**

Run:

```bash
npm run check:login-ui
```

Expected: FAIL because `src/main.js` and CSS have not been updated yet.

- [ ] **Step 4: Commit**

Commit only if the user has explicitly approved commits for this sprint. Otherwise skip this step and leave changes uncommitted.

```bash
git add src/research/login-gate.js
git commit -m "feat: add research login gate module"
```

---

### Task 3: Wire Main Entry And Backend Boundary Guards

**Files:**
- Modify: `src/main.js`
- Modify: `tests/stability-checks.mjs`
- Modify: `tests/research-backend-boundary-check.mjs`
- Test: `tests/research-login-ui-check.mjs`

- [ ] **Step 1: Import login gate in `src/main.js`**

Change `src/main.js` to this complete content:

```js
import './research/version.js';
import './research/event-taxonomy.js';
import './research/content-map.js';
import './research/logger.js';
import './research/instrumentation.js';
import './research/session.js';
import './research/login-gate.js';
import './style-explore.css';
import './motion.js';
import './intro.js';
```

- [ ] **Step 2: Update `tests/stability-checks.mjs` main-entry assertions**

Find the existing main-entry research assertions near the bottom of `tests/stability-checks.mjs`. Keep the existing assertions and add this assertion immediately after the session helper assertion:

```js
assert.match(main, /import '\.\/research\/login-gate\.js';/, 'main.js should load research login gate after session helper');
```

Keep this existing API boundary assertion unchanged:

```js
assert.doesNotMatch(main, /research\/api\.js/, 'main.js should not reference backend API helper before login/submission UI exists');
```

- [ ] **Step 3: Update `tests/research-backend-boundary-check.mjs` file map**

Replace the `files` object with:

```js
const files = {
  loginApi: join(root, 'api', 'login.js'),
  logsBatchApi: join(root, 'api', 'logs-batch.js'),
  session: join(root, 'src', 'research', 'session.js'),
  frontendApi: join(root, 'src', 'research', 'api.js'),
  loginGate: join(root, 'src', 'research', 'login-gate.js'),
  schema: join(root, 'docs', 'supabase-schema-v1.sql'),
  main: join(root, 'src', 'main.js')
};
```

After the existing `const frontendApi = ...` line, add:

```js
const loginGate = readFileSync(files.loginGate, 'utf8');
```

After the existing frontend API helper assertions, add:

```js
assert.match(loginGate, /import\(['"]\.\/api\.js['"]\)/, 'Login gate may call API helper through dynamic import');
assert.doesNotMatch(main, /research\/api\.js/, 'main.js should still avoid direct backend API helper references');
assert.match(main, /import '\.\/research\/login-gate\.js';/, 'main.js should load login gate as the controlled frontend boundary');
```

- [ ] **Step 4: Run targeted checks**

Run:

```bash
npm run check:backend-boundary
npm run check:stability
npm run check:login-ui
```

Expected:

- `check:backend-boundary`: PASS.
- `check:stability`: PASS.
- `check:login-ui`: FAIL because CSS has not been added yet.

- [ ] **Step 5: Commit**

Commit only if the user has explicitly approved commits for this sprint. Otherwise skip this step and leave changes uncommitted.

```bash
git add src/main.js tests/stability-checks.mjs tests/research-backend-boundary-check.mjs
git commit -m "feat: wire research login gate entry"
```

---

### Task 4: Add Research Login Gate CSS

**Files:**
- Modify: `src/style-explore.css`
- Test: `tests/research-login-ui-check.mjs`

- [ ] **Step 1: Add z-index token**

In `:root`, add this token before `--z-cursor`:

```css
  --z-research-login: 9600;
```

- [ ] **Step 2: Append login CSS section**

Append this complete CSS section near other overlay/layer styles, or near the end of the file if a cleaner local placement is not obvious:

```css
/* ============================================================
   Research Login Gate
   ============================================================ */

.has-research-login-gate {
  overflow: hidden;
}

.research-login-gate {
  position: fixed;
  inset: 0;
  z-index: var(--z-research-login);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 5vw, 56px);
  background:
    linear-gradient(135deg, rgba(229, 224, 217, 0.94), rgba(223, 216, 207, 0.9)),
    radial-gradient(circle at 22% 18%, rgba(166, 58, 42, 0.1), transparent 34%),
    radial-gradient(circle at 82% 74%, rgba(48, 65, 67, 0.12), transparent 38%);
}

.research-login-gate[hidden] {
  display: none;
}

.research-login-panel {
  width: min(440px, 100%);
  margin: 0;
  padding: clamp(24px, 4vw, 38px);
  border: 1px solid rgba(48, 65, 67, 0.2);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(248, 245, 238, 0.96), rgba(235, 229, 218, 0.94));
  box-shadow: 0 24px 80px rgba(33, 52, 62, 0.18);
  color: var(--text-base);
}

.research-login-eyebrow {
  margin: 0 0 8px;
  font-family: var(--font-data);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--text-soft);
  text-transform: uppercase;
}

.research-login-heading {
  margin: 0;
  font-family: var(--font-title);
  font-size: clamp(1.7rem, 4vw, 2.25rem);
  line-height: 1.2;
  color: var(--slate-deep);
}

.research-login-copy,
.research-login-privacy {
  margin: 12px 0 0;
  font-family: var(--font-zh);
  font-size: 0.98rem;
  line-height: 1.7;
}

.research-login-privacy {
  color: var(--vermillion);
}

.research-login-field {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}

.research-login-label {
  font-family: var(--font-data);
  font-size: 0.86rem;
  color: var(--text-soft);
}

.research-login-input {
  width: 100%;
  min-height: 46px;
  padding: 10px 12px;
  border: 1px solid rgba(48, 65, 67, 0.26);
  border-radius: 6px;
  background: rgba(255, 252, 245, 0.82);
  color: var(--slate-deep);
  font-family: var(--font-data);
  font-size: 1rem;
}

.research-login-input:focus {
  outline: 2px solid rgba(166, 58, 42, 0.3);
  outline-offset: 2px;
}

.research-login-message {
  margin: 16px 0 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(48, 65, 67, 0.08);
  font-family: var(--font-data);
  font-size: 0.9rem;
  line-height: 1.55;
}

.research-login-message[data-tone="error"] {
  background: rgba(166, 58, 42, 0.11);
  color: #7b2a20;
}

.research-login-message[data-tone="warning"] {
  background: rgba(160, 122, 48, 0.14);
  color: #674d17;
}

.research-login-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.research-login-submit,
.research-login-bypass {
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 6px;
  font-family: var(--font-data);
  font-size: 0.95rem;
  cursor: pointer;
}

.research-login-submit {
  border: 1px solid rgba(166, 58, 42, 0.38);
  background: var(--vermillion);
  color: #fffaf0;
}

.research-login-submit:disabled {
  cursor: wait;
  opacity: 0.68;
}

.research-login-bypass {
  border: 1px solid rgba(48, 65, 67, 0.22);
  background: transparent;
  color: var(--text-base);
}

@media (max-width: 700px) {
  .research-login-gate {
    align-items: flex-start;
    padding: 18px;
    overflow-y: auto;
  }

  .research-login-panel {
    margin-top: min(8vh, 48px);
    padding: 22px;
  }

  .research-login-actions {
    display: grid;
  }

  .research-login-submit,
  .research-login-bypass {
    width: 100%;
  }
}
```

- [ ] **Step 3: Run login UI check**

Run:

```bash
npm run check:login-ui
```

Expected: PASS.

- [ ] **Step 4: Commit**

Commit only if the user has explicitly approved commits for this sprint. Otherwise skip this step and leave changes uncommitted.

```bash
git add src/style-explore.css
git commit -m "style: add research login gate"
```

---

### Task 5: Verify Mode Behaviour In Browser

**Files:**
- No file changes expected.
- Test with the running Vite app.

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
npm run build
```

Expected: all PASS.

- [ ] **Step 2: Start local server if needed**

Run:

```bash
npm run dev
```

Expected: Vite serves the app on `http://localhost:5173/` or another available local URL.

- [ ] **Step 3: Verify normal development URL**

Open:

```text
http://localhost:5173/
```

Expected:

- Existing opening screen appears.
- No research login panel is visible.
- `<html>` has `data-research-login-gate="inactive"`.
- Existing opening interactions remain available.
- Console has no warning/error logs.

- [ ] **Step 4: Verify research URL**

Open:

```text
http://localhost:5173/?mode=research
```

Expected:

- Research login gate appears before the game becomes playable.
- It shows only `參與代碼` and `課節代碼`.
- It shows `請勿輸入真實姓名。`.
- The development bypass button `開發試玩` appears on localhost.
- `<html>` has `data-research-login-gate="visible"` or `data-research-login-gate="returning"`.

- [ ] **Step 5: Verify missing-code validation**

On `?mode=research`, press `進入研究版本` with both fields empty.

Expected:

- Message shows `請輸入參與代碼及課節代碼。`.
- Focus moves to the participant code field.
- No session is saved.

- [ ] **Step 6: Verify backend-not-connected state**

On localhost `?mode=research`, enter:

```text
參與代碼: YW-014
課節代碼: LKKC-2026
```

Press `進入研究版本`.

Expected:

- Because Task 8B API remains a stub, message shows `研究登入尚未連接後台。現在仍可作開發測試。`.
- Gate stays visible.
- `開發試玩` may be used for local development.
- No fake successful session is created.

- [ ] **Step 7: Verify local dev bypass**

Click `開發試玩`.

Expected:

- Gate hides.
- `<html>` has `data-research-login-gate="passed"`.
- Existing opening screen is usable.

- [ ] **Step 8: Verify responsive layouts**

Check these viewports:

```text
1280x720
1024x768
390x844
```

Expected:

- Panel stays readable.
- Buttons are at least 44px high.
- No text overflows the panel.
- Software keyboard space on mobile does not make the form unusable.

- [ ] **Step 9: Commit**

Commit only if the user has explicitly approved commits for this sprint. Otherwise skip this step and leave changes uncommitted.

```bash
git add src/research/login-gate.js src/main.js src/style-explore.css tests/research-login-ui-check.mjs tests/stability-checks.mjs tests/research-backend-boundary-check.mjs package.json
git commit -m "feat: add research mode login gate"
```

---

### Task 6: Update Project Documentation

**Files:**
- Modify: `docs/research-id-map.md`
- Modify: workspace `task_plan.md`
- Modify: workspace `progress.md`

- [ ] **Step 1: Update research map notes**

In `docs/research-id-map.md`, add a short section:

```md
## Task 9 Research Login Gate

The research login gate appears only when the URL includes `?mode=research`.

First implementation scope:

- collects only `participant_code` and `session_code`;
- stores only the limited research session object after a successful future backend login;
- keeps normal development and visual-polish work unblocked at the default URL;
- does not connect Supabase directly;
- does not submit gameplay logs.
```

- [ ] **Step 2: Update workspace task plan**

In `/Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/task_plan.md`, add:

```md
26. [complete] Task 9 Implementation Plan
```

After implementation later completes, add a separate line:

```md
27. [complete] Task 9 Login UI Implementation
```

- [ ] **Step 3: Update workspace progress log**

In `/Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/progress.md`, add:

```md
- 2026-06-10 補記：已完成 `Task 9 Implementation Plan`，輸出 `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/docs/superpowers/plans/2026-06-10-task-9-login-ui.md`。計劃會以 `?mode=research` 作唯一研究登入觸發，新增 `src/research/login-gate.js`，只收 `participant_code` 與 `session_code`，並以 dynamic import 在提交時才呼叫 `src/research/api.js`。一般開發 URL 保持現有遊戲流程；正式實作仍不接 Supabase、不建立個人帳戶登入、不收集真名、email、電話、密碼、社交登入或學生帳號。計劃亦包含 CSS、測試、browser QA、iPad/mobile 檢查和後續文件更新。
```

- [ ] **Step 4: Commit**

Commit only if the user has explicitly approved commits for this sprint. Otherwise skip this step and leave changes uncommitted.

```bash
git add docs/research-id-map.md /Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/task_plan.md /Users/vincentttchan99/Documents/Codex/2026-06-04/files-mentioned-by-the-user-users/progress.md
git commit -m "docs: update research login plan progress"
```

---

## Final Verification Gate

Before reporting implementation complete, run:

```bash
npm run check:syntax
npm run check:stability
npm run check:backend-boundary
npm run check:research-map
npm run check:instrumentation
npm run check:assets
npm run check:login-ui
npm run build
```

Then complete browser QA:

- `http://localhost:5173/`
- `http://localhost:5173/?mode=research`
- desktop `1280x720`
- iPad `1024x768`
- mobile `390x844`

Do not claim the implementation is complete unless these checks pass or any failure is clearly disclosed.

## Self-Review Checklist

- Spec coverage:
  - `?mode=research` trigger: Task 2, Task 5.
  - Default dev flow unchanged: Task 2, Task 5.
  - Participant/session code only: Task 1, Task 2.
  - Forbidden fields: Task 1.
  - Student-facing copy: Task 1, Task 2.
  - Missing/invalid/backend/network/returning states: Task 1, Task 2, Task 5.
  - Limited session saving: Task 2.
  - No Supabase connection: Task 2, Task 3, Task 5.
  - iPad/mobile usability: Task 4, Task 5.

- Placeholder scan:
  - No placeholder markers or open-ended test instructions.

- Type/name consistency:
  - `participant_code` and `session_code` match Task 8B API shape.
  - `saveResearchSession()` and `loadResearchSession()` match existing `src/research/session.js`.
  - `loginWithParticipantCode()` matches existing `src/research/api.js`.
  - `data-research-login-gate` marker is represented by `document.documentElement.dataset.researchLoginGate`.
