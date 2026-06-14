import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  plan: join(root, 'docs', 'task-23-more-event-coverage-plan.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  dataDictionary: join(root, 'docs', 'research-data-dictionary.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const plan = readFileSync(files.plan, 'utf8');
const idMap = readFileSync(files.idMap, 'utf8');
const dataDictionary = readFileSync(files.dataDictionary, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 23 More Event Coverage Plan',
  'Current active event coverage',
  'session_start',
  'city_entered',
  'evidence_task_completed',
  'event_opened',
  'decision_selected',
  'session_end',
  'source_opened',
  'checkpoint_submitted',
  'journal_opened',
  'technical_recovery',
  'Privacy Boundary',
  'stable IDs',
  'do not log visible event prose',
  'do not log',
  'student written responses',
  'Implementation Scope If Approved',
  'Proposed Minimal Implementation Order',
  'Approval Decision'
].forEach((needle) => {
  assert.match(plan, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 23 plan should include ${needle}`);
});

assert.match(idMap, /Task 23 More Event Coverage/i, 'research ID map should reference Task 23');
assert.match(dataDictionary, /Task 23/i, 'research data dictionary should reference Task 23');
assert.match(packageJson, /check:more-event-coverage-plan/, 'package.json should expose check:more-event-coverage-plan');

console.log('task 23 more event coverage plan checks passed');
