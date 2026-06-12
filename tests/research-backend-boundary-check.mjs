import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  loginApi: join(root, 'api', 'login.js'),
  logsBatchApi: join(root, 'api', 'logs-batch.js'),
  serverSupabase: join(root, 'api', '_supabase.js'),
  session: join(root, 'src', 'research', 'session.js'),
  frontendApi: join(root, 'src', 'research', 'api.js'),
  loginGate: join(root, 'src', 'research', 'login-gate.js'),
  schema: join(root, 'docs', 'supabase-schema-v1.sql'),
  main: join(root, 'src', 'main.js')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const loginApi = readFileSync(files.loginApi, 'utf8');
const logsBatchApi = readFileSync(files.logsBatchApi, 'utf8');
const serverSupabase = readFileSync(files.serverSupabase, 'utf8');
const session = readFileSync(files.session, 'utf8');
const frontendApi = readFileSync(files.frontendApi, 'utf8');
const loginGate = readFileSync(files.loginGate, 'utf8');
const schema = readFileSync(files.schema, 'utf8');
const main = readFileSync(files.main, 'utf8');

assert.match(loginApi, /supabase_not_connected/, 'Login API should keep the disabled-backend fallback');
assert.match(loginApi, /resolveLoginResult/, 'Login API should expose a testable dry-run login flow');
assert.match(loginApi, /RESEARCH_BACKEND_ENABLED[^]*dry_run/, 'Login API should only connect in dry_run mode');
assert.match(loginApi, /participant_code/, 'Login API should name participant_code');
assert.match(loginApi, /session_code/, 'Login API should name session_code');
assert.match(logsBatchApi, /supabase_not_connected/, 'Log batch API should remain a Supabase-disconnected stub in Task 8B');
assert.match(logsBatchApi, /events/, 'Log batch API should name events');
assert.match(logsBatchApi, /session/, 'Log batch API should name session');
assert.match(serverSupabase, /@supabase\/supabase-js/, 'Server helper should own the Supabase SDK import');
assert.match(serverSupabase, /SUPABASE_SECRET_KEY/, 'Server helper should use the server-only Supabase key');
assert.match(serverSupabase, /persistSession:\s*false/, 'Server helper should disable browser session persistence');
assert.doesNotMatch(frontendApi, /SUPABASE_SECRET_KEY|@supabase\/supabase-js|createClient/, 'Frontend API helper should not touch Supabase secrets or SDK');
assert.doesNotMatch(loginGate, /SUPABASE_SECRET_KEY|@supabase\/supabase-js|createClient/, 'Login gate should not touch Supabase secrets or SDK');

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
assert.match(loginGate, /import\(['"]\.\/api\.js['"]\)/, 'Login gate may call API helper through dynamic import');
assert.doesNotMatch(main, /research\/api\.js/, 'main.js should still avoid direct backend API helper references');
assert.match(main, /import '\.\/research\/login-gate\.js';/, 'main.js should load login gate as the controlled frontend boundary');

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
