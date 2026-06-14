import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const file = join(root, 'docs', 'task-23b-deployment-live-row-qa-results.md');
const packageJson = join(root, 'package.json');

assert.equal(existsSync(file), true, `Task 23B results should exist at ${file}`);
assert.equal(existsSync(packageJson), true, 'package.json should exist');

const text = readFileSync(file, 'utf8');
const pkg = readFileSync(packageJson, 'utf8');

[
  'Task 23B Deployment And Live Row QA Results',
  '8de8c1d',
  'https://yangwu-research-simulation-app.vercel.app/?mode=research',
  'assets/index-D2KZO0oa.js',
  'assets/index-CVtaNtMW.css',
  'source_opened',
  'checkpoint_submitted',
  '4c8268e7-8862-4db2-a519-84a36550b96a',
  'task23b-live-qa',
  'lkkc-pilot-v1.0',
  'lkkc-may-june-2026',
  'content-freeze-lite-v0.1',
  'research_event_log_long_export',
  'research_privacy_exception_export',
  '0 rows',
  'CSV QA'
].forEach((needle) => {
  assert.match(
    text,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 23B results should include ${needle}`
  );
});

assert.match(pkg, /check:deployment-live-row-qa/, 'Task 23B deployment QA script should remain registered');

console.log('task 23B results checks passed');
