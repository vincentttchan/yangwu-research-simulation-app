import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  handoff: join(root, 'docs', 'task-25-frontend-ui-evidence-checkpoint-dryrun.md'),
  task24: join(root, 'docs', 'task-24-pilot-export-package-handoff.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const text = Object.fromEntries(
  Object.entries(files).map(([label, file]) => [label, readFileSync(file, 'utf8')])
);

[
  'Task 25 Front-End UI Evidence / Checkpoint Dry-Run',
  'production UI',
  'https://yangwu-research-simulation-app.vercel.app/?mode=research',
  'YW-001',
  'LKKC-2026-DRYRUN',
  'source_opened',
  'checkpoint_submitted',
  'front-end',
  'not API-only',
  'Supabase',
  'research_event_log_long_export',
  'lkkc-pilot-v1.0',
  'lkkc-may-june-2026',
  'content-freeze-lite-v0.1',
  'privacy QA',
  '0 row',
  'dry-run QA data',
  'not formal student data',
  'Task 22',
  'Task 24'
].forEach((needle) => {
  assert.match(
    text.handoff,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 25 handoff should include ${needle}`
  );
});

assert.match(text.task24, /Task 25: Front-End UI Evidence \/ Checkpoint Dry-Run/i, 'Task 24 should point to Task 25');
assert.match(text.idMap, /Task 25 Front-End UI Evidence/i, 'Research ID map should reference Task 25');
assert.match(text.packageJson, /check:frontend-ui-dryrun/, 'package.json should expose check:frontend-ui-dryrun');

console.log('task 25 front-end UI dry-run checks passed');
