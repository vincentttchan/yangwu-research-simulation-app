import { readFileSync } from 'node:fs';

const doc = readFileSync('docs/task-31b-route-to-map-mobile-qa-handoff.md', 'utf8');

const requiredMarkers = [
  'Task 31B Route-to-Map / Mobile Map QA Handoff',
  'rendered route-to-map QA not yet passed',
  'must be completed before real iPad / phone / school Wi-Fi QA',
  'Browser plugin was attempted first',
  'Chrome fallback has not been used',
  'data-phase="6"',
  '390 x 844',
  '430 x 932',
  '768 x 1024',
  '1024 x 768',
  'event drawer',
  'stats / resistance drawer',
  'journal',
  'evidence task modal',
  'event modal',
  'no real names',
  'lkkc-pilot-v1.1'
];

const missing = requiredMarkers.filter((marker) => !doc.includes(marker));

if (missing.length) {
  console.error(`Task 31B handoff doc is missing required markers:\n- ${missing.join('\n- ')}`);
  process.exit(1);
}

console.log('task 31B route-to-map mobile handoff checks passed');
