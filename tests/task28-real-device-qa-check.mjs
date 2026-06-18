import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  task28: join(root, 'docs', 'task-28-real-device-school-wifi-qa-checklist.md'),
  task22Results: join(root, 'docs', 'task-22-device-school-network-qa-results.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist`);
});

const task28 = readFileSync(files.task28, 'utf8');
const task22Results = readFileSync(files.task22Results, 'utf8');
const idMap = readFileSync(files.idMap, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 28 Real Device / Network QA Execution Checklist',
  'Task 35',
  'normal-flow route-to-map QA',
  '390 x 844',
  '430 x 932',
  '768 x 1024',
  '1024 x 768',
  'https://yangwu-research-simulation-app.vercel.app/?mode=research',
  'yangwu-research-lkkc-2026',
  'lkkc-pilot-v1.0',
  'lkkc-may-june-2026',
  'content-freeze-lite-v0.1',
  'YW-001',
  'YW-002',
  'YW-999',
  'LKKC-2026-DRYRUN',
  'iPad',
  'Phone',
  'School Wi-Fi',
  'home/individual tester network',
  'school Wi-Fi is not required',
  'Mobile hotspot',
  'Li Hongzhang',
  'Beijing',
  'first normal target',
  'event drawer',
  'stats / resistance drawer',
  'journal',
  'bj-wall',
  'bj-junji',
  'source_opened',
  'evidence_task_completed',
  'decision_selected',
  'checkpoint_submitted',
  'research_event_log_long_export',
  'research_privacy_exception_export',
  'Stop Rules',
  'Pass',
  'Partial',
  'Fail',
  'Research Interpretation Guardrail',
  'HEA',
  'HNET',
  'Transfer Task',
  'PAQ'
].forEach((needle) => {
  assert.match(
    task28,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 28 checklist should include ${needle}`
  );
});

[
  'Task 28',
  'Task 35 local normal-flow UI gate',
  'Task 28 Live Field Sheet',
  'iPad',
  'Phone',
  'School Wi-Fi',
  'Pending'
].forEach((needle) => {
  assert.match(
    task22Results,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 22 results should reference ${needle}`
  );
});

assert.match(idMap, /Task 28 Real Device \/ School Wi-Fi QA/i, 'research ID map should reference Task 28');
assert.match(packageJson, /check:task28-real-device-qa/, 'package.json should expose Task 28 check script');

console.log('task 28 real device school Wi-Fi QA checks passed');
