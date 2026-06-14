import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  guide: join(root, 'docs', 'task-22-device-school-network-qa.md'),
  template: join(root, 'docs', 'task-22-device-school-network-qa-results-template.md'),
  results: join(root, 'docs', 'task-22-device-school-network-qa-results.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  signoff: join(root, 'docs', 'task-20-1-student-pilot-readiness-signoff.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const guide = readFileSync(files.guide, 'utf8');
const template = readFileSync(files.template, 'utf8');
const results = readFileSync(files.results, 'utf8');
const idMap = readFileSync(files.idMap, 'utf8');
const signoff = readFileSync(files.signoff, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 22 Device / School Network QA',
  'https://yangwu-research-simulation-app.vercel.app/?mode=research',
  'lkkc-pilot-v1.0',
  'lkkc-may-june-2026',
  'content-freeze-lite-v0.1',
  'YW-001',
  'YW-002',
  'LKKC-2026-DRYRUN',
  'Desktop or laptop',
  'iPad',
  'Student-sized phone',
  'School Wi-Fi',
  'Mobile hotspot fallback',
  'city',
  'evidence task',
  'historical event',
  'decision',
  'journal',
  'event modal',
  'Supabase Verification',
  'Privacy QA',
  'research_privacy_exception_export',
  'Pass',
  'Partial',
  'Fail'
].forEach((needle) => {
  assert.match(guide, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 22 guide should include ${needle}`);
});

[
  'QA Metadata',
  'Device Matrix',
  'Desktop/laptop',
  'iPad',
  'Phone',
  'School Wi-Fi check',
  'Supabase Row Verification',
  'Privacy QA',
  'Layout / Usability Notes',
  'Network Notes',
  'Decision',
  'Device/network QA passed',
  'Device/network QA failed'
].forEach((needle) => {
  assert.match(template, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 22 template should include ${needle}`);
});

assert.match(idMap, /Task 22 Device \/ School Network QA/i, 'research ID map should reference Task 22');
assert.match(signoff, /Task 22/i, 'Task 20.1 sign-off should reference Task 22');
assert.match(packageJson, /check:device-network-qa/, 'package.json should expose check:device-network-qa');

[
  'Task 22 Device / School Network QA Results',
  'Current decision: pending',
  'YW-001',
  'YW-002',
  'LKKC-2026-DRYRUN',
  'lkkc-pilot-v1.0',
  'iPad',
  'Phone',
  'School Wi-Fi',
  'Supabase Row Verification',
  'Privacy QA',
  'Pending',
  'Required follow-up before student use'
].forEach((needle) => {
  assert.match(results, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 22 results should include ${needle}`);
});

console.log('task 22 device/network QA checks passed');
