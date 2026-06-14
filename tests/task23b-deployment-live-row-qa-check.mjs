import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  handoff: join(root, 'docs', 'task-23b-deployment-live-row-qa.md'),
  task23a: join(root, 'docs', 'task-23a-source-checkpoint-event-coverage.md'),
  exportSql: join(root, 'docs', 'supabase-research-export-queries.sql'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const handoff = readFileSync(files.handoff, 'utf8');
const task23a = readFileSync(files.task23a, 'utf8');
const exportSql = readFileSync(files.exportSql, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 23B Deployment And Live Row QA',
  'source_opened',
  'checkpoint_submitted',
  'https://yangwu-research-simulation-app.vercel.app/?mode=research',
  'yangwu-research-lkkc-2026',
  'lkkc-pilot-v1.0',
  'lkkc-may-june-2026',
  'content-freeze-lite-v0.1',
  'YW-001',
  'LKKC-2026-DRYRUN',
  'docs/supabase-research-export-queries.sql',
  'research_event_log_long_export',
  'research_privacy_exception_export',
  '0 rows',
  'npm run check:research-csv-export'
].forEach((needle) => {
  assert.match(
    handoff,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 23B handoff should include ${needle}`
  );
});

[
  'source',
  'task_type',
  'checkpoint_type',
  'checkpoint_correct',
  'attempt_index'
].forEach((needle) => {
  assert.match(exportSql, new RegExp(needle), `Export SQL should include ${needle}`);
  assert.match(handoff, new RegExp(needle), `Task 23B handoff should mention ${needle}`);
});

assert.match(task23a, /Required Post-Deployment QA/i, 'Task 23A should still define post-deployment QA');
assert.match(packageJson, /check:deployment-live-row-qa/, 'package.json should expose check:deployment-live-row-qa');

console.log('task 23B deployment/live row QA checks passed');
