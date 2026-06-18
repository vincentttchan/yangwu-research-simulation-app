import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  task27: join(root, 'docs', 'task-27-frontend-dryrun-repeat.md'),
  task22Results: join(root, 'docs', 'task-22-device-school-network-qa-results.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist`);
});

const task27 = readFileSync(files.task27, 'utf8');
const task22Results = readFileSync(files.task22Results, 'utf8');
const idMap = readFileSync(files.idMap, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 27 Front-End Dry-Run Repeat',
  'e8317a6f-9df2-41c4-a027-5569b9f6a742',
  '00b5db59-d942-47e7-85b6-c3915ca9f729',
  'source_opened',
  'evidence_task_completed',
  'decision_selected',
  'checkpoint_submitted',
  'research_event_log_long_export',
  'research_privacy_exception_export',
  'privacy_exception_rows',
  '0',
  'lkkc-pilot-v1.0',
  'lkkc-may-june-2026',
  'content-freeze-lite-v0.1',
  'iPad / phone / school Wi-Fi QA'
].forEach((needle) => {
  assert.match(task27, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 27 doc should include ${needle}`);
});

[
  'Task 27',
  'e8317a6f-9df2-41c4-a027-5569b9f6a742',
  '00b5db59-d942-47e7-85b6-c3915ca9f729',
  'source_opened',
  'checkpoint_submitted',
  'privacy_exception_export',
  '0',
  'Pending'
].forEach((needle) => {
  assert.match(task22Results, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 22 results should include ${needle}`);
});

assert.match(idMap, /Task 27 Front-End Dry-Run Repeat/i);
assert.match(packageJson, /check:task27-dryrun/);

console.log('task 27 front-end dry-run repeat checks passed');
