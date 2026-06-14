import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  handoff: join(root, 'docs', 'task-23a-source-checkpoint-event-coverage.md'),
  intro: join(root, 'src', 'intro.js'),
  instrumentation: join(root, 'src', 'research', 'instrumentation.js'),
  logsBatch: join(root, 'api', 'logs-batch.js'),
  exportSql: join(root, 'docs', 'supabase-research-export-queries.sql'),
  csvQa: join(root, 'scripts', 'research-csv-export-qa.mjs'),
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
  'source_opened',
  'checkpoint_submitted',
  'lkkc-pilot-v1.0',
  'Privacy Boundary',
  'Required Post-Deployment QA'
].forEach((needle) => {
  assert.match(text.handoff, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 23A handoff should include ${needle}`);
});

assert.match(text.instrumentation, /logSourceOpened/, 'Instrumentation should expose logSourceOpened');
assert.match(text.instrumentation, /EVENT_TYPES\.SOURCE_OPENED/, 'Instrumentation should use SOURCE_OPENED taxonomy');
assert.match(text.instrumentation, /logCheckpointSubmitted/, 'Instrumentation should expose logCheckpointSubmitted');
assert.match(text.instrumentation, /EVENT_TYPES\.CHECKPOINT_SUBMITTED/, 'Instrumentation should use CHECKPOINT_SUBMITTED taxonomy');
assert.match(text.intro, /logSourceOpened/, 'Game flow should call logSourceOpened');
assert.match(text.intro, /logCheckpointSubmitted/, 'Game flow should call logCheckpointSubmitted');
assert.match(text.logsBatch, /checkpoint_type/, 'Server allowlist should include checkpoint_type');
assert.match(text.logsBatch, /checkpoint_correct/, 'Server allowlist should include checkpoint_correct');
assert.match(text.logsBatch, /attempt_index/, 'Server allowlist should include attempt_index');
assert.match(text.exportSql, /checkpoint_correct/, 'Export SQL should expose checkpoint_correct');
assert.match(text.exportSql, /task_type/, 'Export SQL should expose task_type');
assert.match(
  text.exportSql,
  /evidence_task_id[\s\S]*hotspot_id[\s\S]*choice_id[\s\S]*content_map_version[\s\S]*source[\s\S]*task_type[\s\S]*checkpoint_type[\s\S]*checkpoint_correct[\s\S]*attempt_index/,
  'Task 23A export columns should be appended after the original event-log view columns to keep CREATE OR REPLACE VIEW compatible'
);
assert.match(text.csvQa, /checkpoint_type/, 'CSV QA should require checkpoint_type');
assert.match(text.manifest, /attempt_index/, 'CSV manifest should include attempt_index');
assert.match(text.idMap, /Task 23A Source And Checkpoint Event Coverage/i, 'Research ID map should reference Task 23A');
assert.match(text.packageJson, /check:event-coverage-implementation/, 'package.json should expose check:event-coverage-implementation');

[
  'choice_label',
  'response_text',
  'student_id',
  'email',
  'phone',
  'name_to_code'
].forEach((needle) => {
  assert.doesNotMatch(text.logsBatch, new RegExp(`['"]${needle}['"]`), `Server allowlist should not include ${needle}`);
});

console.log('task 23A event coverage implementation checks passed');
