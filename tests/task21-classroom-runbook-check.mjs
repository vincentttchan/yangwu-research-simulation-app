import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  runbook: join(root, 'docs', 'task-21-teacher-classroom-pilot-runbook.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  signoff: join(root, 'docs', 'task-20-1-student-pilot-readiness-signoff.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const runbook = readFileSync(files.runbook, 'utf8');
const idMap = readFileSync(files.idMap, 'utf8');
const signoff = readFileSync(files.signoff, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 21 Teacher / Classroom Pilot Runbook',
  'Formal research data collection status',
  'https://yangwu-research-simulation-app.vercel.app/?mode=research',
  'lkkc-pilot-v1.0',
  'lkkc-may-june-2026',
  'content-freeze-lite-v0.1',
  'Lok Sin Tong Leung Kau Kui College',
  'Roles',
  'Pre-Lesson Checklist',
  'Recommended Lesson Flow',
  'Student-Facing Board Instructions',
  'Teacher Opening Script',
  'Support Rules During Play',
  'Fallback Actions',
  'Stop Conditions',
  'Post-Lesson Data Procedure',
  'Supabase Quick Checks',
  'Field Note Template',
  'iPad',
  'phone',
  'school-network',
  'name-to-code',
  'privacy QA',
  'dataset_session_summary.csv',
  'dataset_event_log_long.csv',
  'dataset_complexity_exposure.csv',
  'dataset_assessment_scores.csv',
  'dataset_dashboard_overview.csv',
  'dataset_privacy_exceptions.csv'
].forEach((needle) => {
  assert.match(runbook, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `runbook should include ${needle}`);
});

[
  'real name',
  'student ID',
  'email',
  'phone number',
  'Supabase'
].forEach((needle) => {
  assert.match(runbook, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `runbook should include data minimisation wording for ${needle}`);
});

assert.match(idMap, /Task 21 Teacher \/ Classroom Pilot Runbook/i, 'research ID map should reference Task 21 runbook');
assert.match(signoff, /teacher\/researcher classroom runbook/i, 'Task 20.1 sign-off should reference classroom runbook');
assert.match(packageJson, /check:classroom-runbook/, 'package.json should expose check:classroom-runbook');

console.log('task 21 classroom runbook checks passed');
