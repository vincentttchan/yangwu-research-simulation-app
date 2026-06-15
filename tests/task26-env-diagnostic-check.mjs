import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const mod = await import('../api/research-env-diagnostic.js?task26=' + Date.now());
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

assert.equal(typeof mod.buildResearchEnvDiagnostic, 'function');

const diagnostic = mod.buildResearchEnvDiagnostic({
  RESEARCH_BACKEND_ENABLED: 'dry_run',
  SUPABASE_URL: 'https://zjmuydbuskxouqlkcspy.supabase.co',
  SUPABASE_SECRET_KEY: [
    'header',
    Buffer.from(JSON.stringify({ ref: 'zjmuydbuskxouqlkcspy' })).toString('base64url'),
    'signature'
  ].join('.'),
  SUPABASE_SCHEMA: 'public',
  RESEARCH_COHORT: 'lkkc-may-june-2026',
  APP_VERSION: 'lkkc-pilot-v1.0'
});

assert.equal(diagnostic.backend_enabled, 'dry_run');
assert.equal(diagnostic.supabase_url_present, true);
assert.equal(diagnostic.supabase_url_ref, 'zjmuydbuskxouqlkcspy');
assert.equal(diagnostic.supabase_url_matches_expected, true);
assert.equal(diagnostic.supabase_secret_key_present, true);
assert.equal(diagnostic.supabase_secret_key_ref, 'zjmuydbuskxouqlkcspy');
assert.equal(diagnostic.supabase_secret_key_matches_expected, true);
assert.equal(diagnostic.supabase_schema, 'public');
assert.equal(diagnostic.research_cohort, 'lkkc-may-june-2026');
assert.equal(diagnostic.app_version, 'lkkc-pilot-v1.0');
assert.equal(JSON.stringify(diagnostic).includes('signature'), false);
assert.equal(JSON.stringify(diagnostic).includes('header'), false);

const bad = mod.buildResearchEnvDiagnostic({
  RESEARCH_BACKEND_ENABLED: 'dry_run',
  SUPABASE_URL: 'https://different-ref.supabase.co',
  SUPABASE_SECRET_KEY: 'not-a-jwt',
  SUPABASE_SCHEMA: 'public'
});

assert.equal(bad.supabase_url_ref, 'different-ref');
assert.equal(bad.supabase_url_matches_expected, false);
assert.equal(bad.supabase_secret_key_ref, null);
assert.equal(bad.supabase_secret_key_matches_expected, false);

const docPath = join(root, 'docs', 'task-26-vercel-supabase-environment-alignment.md');
const idMapPath = join(root, 'docs', 'research-id-map.md');
const task25Path = join(root, 'docs', 'task-25-frontend-ui-evidence-checkpoint-dryrun.md');
const packagePath = join(root, 'package.json');

assert.equal(existsSync(docPath), true, 'Task 26 document should exist');
const doc = readFileSync(docPath, 'utf8');
const idMap = readFileSync(idMapPath, 'utf8');
const task25 = readFileSync(task25Path, 'utf8');
const pkg = readFileSync(packagePath, 'utf8');

[
  'Task 26 Vercel / Supabase Environment Alignment Sprint',
  'zjmuydbuskxouqlkcspy',
  'research-env-diagnostic',
  'ea9b6b2e-3b5e-492f-b460-c613223fa0f7',
  'c8c8f86f-3497-4062-8b7d-92b1cfbb2be1',
  'source_opened',
  'checkpoint_submitted',
  'research_event_log_long_export',
  'SQL Editor QA Correction',
  'privacy_exception_rows',
  '0',
  'lkkc-pilot-v1.0',
  'lkkc-may-june-2026',
  'content-freeze-lite-v0.1'
].forEach((needle) => {
  assert.match(doc, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 26 doc should include ${needle}`);
});

assert.match(idMap, /Task 26 Vercel \/ Supabase Environment Alignment/i);
assert.match(task25, /superseded by Task 26/i);
assert.match(pkg, /check:env-alignment/);

console.log('task 26 env diagnostic checks passed');
