import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  task18: join(root, 'docs', 'task-18-supabase-export-implementation-qa.md'),
  manifest: join(root, 'docs', 'researcher-csv-export-manifest.md'),
  exportSql: join(root, 'docs', 'supabase-research-export-queries.sql'),
  csvQa: join(root, 'scripts', 'research-csv-export-qa.mjs'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const task18 = readFileSync(files.task18, 'utf8');
const manifest = readFileSync(files.manifest, 'utf8');
const exportSql = readFileSync(files.exportSql, 'utf8');
const csvQa = readFileSync(files.csvQa, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Supabase SQL Editor',
  'CSV export QA',
  'research_session_summary_export',
  'research_event_log_long_export',
  'research_complexity_exposure_export',
  'research_assessment_scores_export',
  'research_privacy_exception_export',
  'not ready for formal research data collection',
  'name-to-code'
].forEach((needle) => {
  assert.match(task18, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 18 guide should include ${needle}`);
});

[
  'dataset_session_summary.csv',
  'dataset_event_log_long.csv',
  'dataset_complexity_exposure.csv',
  'dataset_assessment_scores.csv',
  'research_privacy_exception_export',
  'Required columns',
  'Export readiness'
].forEach((needle) => {
  assert.match(manifest, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `CSV manifest should include ${needle}`);
});

[
  'security_invoker = true',
  'research_session_summary_export',
  'research_dashboard_overview_export',
  'research_privacy_exception_export',
  'live_dryrun_qa'
].forEach((needle) => {
  assert.match(exportSql, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Export SQL should include ${needle}`);
});

[
  'parseCsv',
  'validateExportDirectory',
  'dataset_session_summary.csv',
  'dataset_event_log_long.csv',
  'live_dryrun_qa',
  'privacy exception',
  'APP_VERSION'
].forEach((needle) => {
  assert.match(csvQa, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `CSV QA script should include ${needle}`);
});

assert.match(packageJson, /check:research-csv-export/, 'package.json should expose check:research-csv-export');
assert.match(packageJson, /check:research-export-implementation/, 'package.json should expose check:research-export-implementation');

console.log('task 18 export implementation checks passed');
