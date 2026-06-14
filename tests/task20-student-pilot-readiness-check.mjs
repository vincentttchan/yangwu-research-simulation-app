import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  guide: join(root, 'docs', 'task-20-student-pilot-readiness-gate.md'),
  template: join(root, 'docs', 'task-20-student-pilot-readiness-signoff-template.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const guide = readFileSync(files.guide, 'utf8');
const template = readFileSync(files.template, 'utf8');
const idMap = readFileSync(files.idMap, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 20 Student Pilot Readiness / Research Freeze Gate',
  'Formal research data collection status: not ready',
  'Research And Ethics Readiness',
  'App And Content Freeze Readiness',
  'Technical And Data Readiness',
  'Device And Classroom Readiness',
  'Researcher Export And Monitoring Readiness',
  'APP_VERSION',
  'RESEARCH_COHORT',
  'content_map_version',
  '?mode=research',
  'game_sessions',
  'event_logs',
  'POST /api/logs-batch',
  'research_privacy_exception_export',
  'npm run check:research-csv-export',
  'name-to-code',
  'Supabase',
  'Vercel',
  'iPad',
  'phone',
  'Stop / Fix Conditions',
  'approved for limited pilot',
  'not approved'
].forEach((needle) => {
  assert.match(guide, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 20 guide should include ${needle}`);
});

[
  'Pilot Metadata',
  'Gate A',
  'Gate B',
  'Gate C',
  'Gate D',
  'Gate E',
  'Dry-run Evidence Reviewed',
  'Unresolved Issues',
  'Decision',
  'Approved for limited pilot',
  'Approved with conditions',
  'Not approved'
].forEach((needle) => {
  assert.match(template, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Task 20 template should include ${needle}`);
});

assert.match(idMap, /Task 20/i, 'research ID map should reference Task 20');
assert.match(packageJson, /check:student-pilot-readiness/, 'package.json should expose check:student-pilot-readiness');

console.log('task 20 student pilot readiness checks passed');
