import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  dictionary: join(root, 'docs', 'research-data-dictionary.md'),
  qaSql: join(root, 'docs', 'supabase-research-qa-queries.sql'),
  task16: join(root, 'docs', 'task-16-research-dataset-qa.md'),
  contentMap: join(root, 'src', 'research', 'content-map.js'),
  instrumentation: join(root, 'src', 'research', 'instrumentation.js'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const dictionary = readFileSync(files.dictionary, 'utf8');
const qaSql = readFileSync(files.qaSql, 'utf8');
const task16 = readFileSync(files.task16, 'utf8');
const contentMap = readFileSync(files.contentMap, 'utf8');
const instrumentation = readFileSync(files.instrumentation, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'RQ1',
  'RQ2',
  'RQ3',
  'participants',
  'game_sessions',
  'event_logs',
  'assessment_responses',
  'research_scores',
  'derived_indicators',
  'Raw process trace',
  'Derived indicator',
  'Pseudonymous',
  'Do not store'
].forEach((needle) => {
  assert.match(dictionary, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Dictionary should include ${needle}`);
});

[
  'distinct_complexity_dimensions_encountered',
  'evidence_tasks_completed_total',
  'evidence_before_decision_ratio',
  'japan_comparison_exposure',
  'institutional_political_financial_exposure',
  'completed_intervention_session'
].forEach((needle) => {
  assert.match(dictionary, new RegExp(needle, 'i'), `Dictionary should define indicator ${needle}`);
  assert.match(qaSql, new RegExp(needle, 'i'), `QA SQL should check or derive ${needle}`);
});

[
  'choice_label',
  'response_text',
  'name_to_code',
  'student_id',
  'email',
  'phone'
].forEach((needle) => {
  assert.match(qaSql, new RegExp(needle, 'i'), `QA SQL should include privacy check for ${needle}`);
});

[
  'technology',
  'institutions',
  'finance',
  'court_politics',
  'public_attitudes',
  'actor_constraints',
  'japan_comparison'
].forEach((needle) => {
  assert.match(dictionary, new RegExp(needle, 'i'), `Dictionary should define complexity dimension ${needle}`);
  assert.match(contentMap, new RegExp(needle, 'i'), `Content map should include complexity dimension ${needle}`);
});

assert.match(instrumentation, /complexity_dimensions/, 'Instrumentation should emit complexity_dimensions');
assert.match(packageJson, /check:research-data/, 'package.json should expose check:research-data');
assert.match(task16, /formal research data collection status:\s*not ready/i, 'Task 16 should keep formal collection boundary explicit');
assert.match(task16, /Supabase Row QA/i, 'Task 16 should include Supabase row QA guidance');

console.log('task 16 research data checks passed');
