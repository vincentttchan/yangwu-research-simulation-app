import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  task19: join(root, 'docs', 'task-19-pilot-data-capture-dry-run.md'),
  resultsTemplate: join(root, 'docs', 'task-19-pilot-dryrun-results-template.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const task19 = readFileSync(files.task19, 'utf8');
const resultsTemplate = readFileSync(files.resultsTemplate, 'utf8');
const idMap = readFileSync(files.idMap, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 19 Pilot Data Capture / First Real Research Dry-run',
  'Formal research data collection status: not ready',
  '?mode=research',
  'YW-001',
  'YW-002',
  'LKKC-2026-DRYRUN',
  'session_start',
  'city_entered',
  'evidence_task_completed',
  'event_opened',
  'decision_selected',
  'session_end',
  'Supabase Row Check',
  'CSV Re-export',
  'npm run check:research-csv-export -- /path/to/export-folder',
  'dataset_session_summary.csv',
  'dataset_event_log_long.csv',
  'dataset_complexity_exposure.csv',
  'dataset_assessment_scores.csv',
  'dataset_dashboard_overview.csv',
  'dataset_privacy_exceptions.csv',
  'RQ1',
  'RQ2',
  'RQ3',
  'name-to-code',
  'do not use real students'
].forEach((needle) => {
  assert.match(task19, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 19 guide should include ${needle}`);
});

[
  'Dry-run Date',
  'Deployment URL',
  'Participant Code',
  'Session Code',
  'Event Coverage',
  'CSV Export Folder',
  'Research Interpretation Note',
  'Stop / Fix Items'
].forEach((needle) => {
  assert.match(resultsTemplate, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 19 results template should include ${needle}`);
});

assert.match(idMap, /Task 19/i, 'research ID map should reference Task 19');
assert.match(packageJson, /check:pilot-dryrun/, 'package.json should expose check:pilot-dryrun');

console.log('task 19 pilot dry-run checks passed');
