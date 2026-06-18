import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  task30: join(root, 'docs', 'task-30-mobile-ipad-ui-stabilisation-gate.md'),
  task28: join(root, 'docs', 'task-28-real-device-school-wifi-qa-checklist.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  styles: join(root, 'src', 'style-explore.css'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist`);
});

const task30 = readFileSync(files.task30, 'utf8');
const task28 = readFileSync(files.task28, 'utf8');
const idMap = readFileSync(files.idMap, 'utf8');
const styles = readFileSync(files.styles, 'utf8');
const packageJson = readFileSync(files.packageJson, 'utf8');

[
  'Task 30 Mobile / iPad UI Stabilisation Gate',
  'Task 28',
  'Task 29',
  'Research Login',
  'Map And Panels',
  'City / Evidence / Event',
  'Coachmark',
  'APP_VERSION Rule',
  'lkkc-pilot-v1.0',
  'lkkc-pilot-v1.1',
  '390 x 844',
  '430 x 932',
  '768 x 1024',
  '1024 x 768',
  '1280 x 720',
  'event timeline',
  'stats',
  'journal',
  'evidence task',
  'event modal',
  'No horizontal overflow',
  'Pass',
  'Conditional Pass',
  'Fail'
].forEach((needle) => {
  assert.match(
    task30,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 30 gate should include ${needle}`
  );
});

[
  'Task 30',
  'UI',
  'before real iPad / phone / school Wi-Fi QA'
].forEach((needle) => {
  assert.match(
    task28,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 28 checklist should reference ${needle}`
  );
});

assert.match(idMap, /Task 30 Mobile \/ iPad UI Stabilisation Gate/i);
assert.match(packageJson, /check:mobile-ipad-ui-gate/);

[
  'Task 30 · Pilot Mobile/iPad Stabilisation Override',
  'overflow-x: hidden',
  'screen--map[data-phase="6"]',
  'map-events',
  '#mapStatsTab.map-stats-tab',
  'map-stats',
  'city-mission-sheet',
  'evidence-task-modal',
  'event-modal',
  'max-height: calc(100dvh',
  'min-width: 44px',
  'min-height: 44px'
].forEach((needle) => {
  assert.match(
    styles,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `mobile stabilisation CSS should include ${needle}`
  );
});

console.log('task 30 mobile/ipad UI stabilisation gate checks passed');
