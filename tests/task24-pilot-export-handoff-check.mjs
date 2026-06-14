import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  handoff: join(root, 'docs', 'task-24-pilot-export-package-handoff.md'),
  task23b: join(root, 'docs', 'task-23b-deployment-live-row-qa-results.md'),
  manifest: join(root, 'docs', 'researcher-csv-export-manifest.md'),
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
  'Task 24 Pilot Export Package / Research Data Handoff',
  'exports/task23b-2026-06-15',
  'dry-run QA data',
  'not formal student data',
  'dataset_session_summary.csv',
  'dataset_event_log_long.csv',
  'dataset_complexity_exposure.csv',
  'dataset_assessment_scores.csv',
  'dataset_dashboard_overview.csv',
  'dataset_privacy_exceptions.csv',
  '16 data row',
  '17 data row',
  '0 data row',
  'privacy QA',
  'research_privacy_exception_export',
  'Task 23A columns',
  'source',
  'task_type',
  'checkpoint_type',
  'checkpoint_correct',
  'attempt_index',
  'HEA',
  'HNET',
  'Transfer Task',
  'PAQ',
  'focus group',
  'front-end UI evidence/checkpoint dry-run',
  'Task 22',
  'name-to-code'
].forEach((needle) => {
  assert.match(
    text.handoff,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 24 handoff should include ${needle}`
  );
});

assert.match(text.task23b, /CSV Export Package/i, 'Task 23B results should record CSV export package');
assert.match(text.manifest, /Researcher CSV Export Manifest/i, 'CSV manifest should exist as source of truth');
assert.match(text.idMap, /Task 24 Pilot Export Package/i, 'Research ID map should reference Task 24');
assert.match(text.packageJson, /check:pilot-export-handoff/, 'package.json should expose check:pilot-export-handoff');

console.log('task 24 pilot export handoff checks passed');
