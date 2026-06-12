import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  guide: join(root, 'docs', 'task-13-first-preview-dryrun-guide.md'),
  template: join(root, 'docs', 'task-13-first-preview-dryrun-results-template.md'),
  researchMap: join(root, 'docs', 'research-id-map.md')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const guide = readFileSync(files.guide, 'utf8');
const template = readFileSync(files.template, 'utf8');
const researchMap = readFileSync(files.researchMap, 'utf8');

[
  'not ready for formal research data collection',
  'DRYRUN_QA_BASE_URL',
  'npm run check:live-dryrun',
  'YW-001',
  'YW-002',
  'YW-999',
  'LKKC-2026-DRYRUN',
  'RESEARCH_BACKEND_ENABLED=dry_run',
  'Production keeps `RESEARCH_BACKEND_ENABLED=false`',
  'POST /api/logs-batch',
  'supabase_not_connected',
  'name-to-code matching list',
  'Stop Conditions'
].forEach((needle) => {
  assert.match(guide, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Guide should include ${needle}`);
});

[
  'Do not record Supabase URL, secret keys',
  'Live QA Script',
  'Browser QA',
  'Supabase Row Check',
  'No `event_logs` created by Task 13',
  'Task 13 passing does not mean formal research data collection is ready'
].forEach((needle) => {
  assert.match(template, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Template should include ${needle}`);
});

assert.match(researchMap, /Task 13 First Real Preview Dry-run/, 'Research map should record Task 13');
assert.doesNotMatch(guide, /sb_secret_[A-Za-z0-9_-]+/, 'Guide should not contain real Supabase secret keys');
assert.doesNotMatch(template, /sb_secret_[A-Za-z0-9_-]+/, 'Template should not contain real Supabase secret keys');
assert.doesNotMatch(guide, /https:\/\/[a-z0-9-]+\.supabase\.co/i, 'Guide should not contain a real Supabase URL');
assert.doesNotMatch(template, /https:\/\/[a-z0-9-]+\.supabase\.co/i, 'Template should not contain a real Supabase URL');

console.log('task 13 documentation checks passed');
