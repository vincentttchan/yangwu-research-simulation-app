import { readFileSync } from 'node:fs';

const doc = readFileSync('docs/task-31-rendered-responsive-ui-readiness.md', 'utf8');

const required = [
  'Task 31 Rendered Responsive UI Readiness',
  'partial pass',
  'real iPad and phone QA remains deferred',
  'npm run check:syntax',
  'npm run check:stability',
  'npm run check:assets',
  'npm run check:mobile-ipad-ui-gate',
  'npm run build',
  '1280 x 720',
  '1024 x 768',
  '768 x 1024',
  '430 x 932',
  '390 x 844',
  's2c-stage is-deck is-showcase',
  'route-to-map transition',
  'mobile map default state',
  'Continue UI update first'
];

const missing = required.filter((needle) => !doc.includes(needle));

if (missing.length) {
  console.error(`Task 31 readiness doc is missing required markers:\n- ${missing.join('\n- ')}`);
  process.exit(1);
}

console.log('task 31 rendered responsive UI readiness checks passed');
