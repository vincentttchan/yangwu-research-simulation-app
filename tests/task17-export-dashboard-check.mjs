import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  exportPlan: join(root, 'docs', 'researcher-export-dashboard-plan.md'),
  exportSql: join(root, 'docs', 'supabase-research-export-queries.sql'),
  task17: join(root, 'docs', 'task-17-researcher-export-dashboard-planning.md'),
  dictionary: join(root, 'docs', 'research-data-dictionary.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const exportPlan = readFileSync(files.exportPlan, 'utf8');
const exportSql = readFileSync(files.exportSql, 'utf8');
const task17 = readFileSync(files.task17, 'utf8');
const dictionary = readFileSync(files.dictionary, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Researcher Export',
  'Dashboard Brief',
  'RQ1',
  'RQ2',
  'RQ3',
  'dataset_session_summary',
  'dataset_event_log_long',
  'dataset_complexity_exposure',
  'dataset_assessment_scores',
  'exclude live_dryrun_qa',
  'pseudonymous',
  'name-to-code',
  'not ready for formal research data collection'
].forEach((needle) => {
  assert.match(exportPlan, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Export/dashboard plan should include ${needle}`);
});

[
  'research_session_summary_export',
  'research_event_log_long_export',
  'research_complexity_exposure_export',
  'research_dashboard_overview_export',
  'live_dryrun_qa',
  'evidence_before_decision_ratio',
  'distinct_complexity_dimensions_encountered',
  'japan_comparison_exposure',
  'institutional_political_financial_exposure',
  'completed_intervention_session'
].forEach((needle) => {
  assert.match(exportSql, new RegExp(needle, 'i'), `Export SQL should include ${needle}`);
});

[
  'Default View',
  'Filters',
  'KPI cards',
  'Charts',
  'Tables',
  'Export Readiness',
  'Interpretation Guardrails'
].forEach((needle) => {
  assert.match(task17, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 17 handoff should include ${needle}`);
});

[
  'distinct_complexity_dimensions_encountered',
  'evidence_before_decision_ratio',
  'completed_intervention_session'
].forEach((needle) => {
  assert.match(dictionary, new RegExp(needle, 'i'), `Task 17 should remain aligned with Task 16 dictionary indicator ${needle}`);
});

assert.match(packageJson, /check:research-export/, 'package.json should expose check:research-export');

console.log('task 17 researcher export/dashboard checks passed');
