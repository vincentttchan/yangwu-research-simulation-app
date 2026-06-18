import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const docPath = join('docs', 'task-34-new-asset-render-qa.md');
const summaryPath = join('docs', 'qa-artifacts', 'task34-final', 'task34-final-render-qa-summary.json');

assert.equal(existsSync(docPath), true, 'Task 34 QA document should exist');
assert.equal(existsSync(summaryPath), true, 'Task 34 render QA summary should exist');

const doc = readFileSync(docPath, 'utf8');
const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));

[
  'Task 34 New Asset Render QA',
  'conditional pass for new asset loading',
  'Formal research data collection status: still `No-Go`',
  '1280 x 720',
  '1024 x 768',
  '390 x 844',
  'east-asia-historical.webp',
  'city-beijing.webp',
  'bj-wall.webp',
  'e_yuanmingyuan.webp',
  'Visible broken images',
  'Horizontal overflow',
  'Stable map visual proof',
  'Stable city visual proof',
  'Conditional Pass',
  'Task 28',
  'Task 29',
  'Task 32'
].forEach((needle) => {
  assert.match(
    doc,
    new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    `Task 34 doc should include ${needle}`
  );
});

assert.equal(Array.isArray(summary.runLog), true, 'Task 34 summary should include runLog');
assert.equal(summary.runLog.length, 3, 'Task 34 summary should include three viewport runs');

const requiredViewportNames = new Set(['desktop-1280x720', 'ipad-1024x768', 'phone-390x844']);

for (const run of summary.runLog) {
  assert.equal(requiredViewportNames.has(run.viewport.name), true, `Unexpected viewport ${run.viewport.name}`);
  assert.equal(Object.keys(run.files).length, 4, `${run.viewport.name} should have four screenshots`);
  Object.values(run.files).forEach((file) => {
    assert.equal(existsSync(file), true, `Screenshot should exist: ${file}`);
    assert.ok(statSync(file).size > 20_000, `Screenshot should not be empty: ${file}`);
  });

  Object.values(run.states).forEach((state) => {
    assert.equal(state.overflowX, 0, `${state.label} should not horizontally overflow`);
    assert.equal(state.brokenVisible.length, 0, `${state.label} should have no visible broken images`);
  });

  assert.equal(run.states.mapState.keyImages.map.nw, 1586, `${run.viewport.name} map width should match asset`);
  assert.equal(run.states.mapState.keyImages.map.nh, 992, `${run.viewport.name} map height should match asset`);
  assert.equal(run.states.cityState.keyImages.city.nw, 1600, `${run.viewport.name} city width should match asset`);
  assert.equal(run.states.cityState.keyImages.city.nh, 900, `${run.viewport.name} city height should match asset`);
  assert.equal(run.states.evidenceState.keyImages.evidence.nw, 1600, `${run.viewport.name} evidence width should match asset`);
  assert.equal(run.states.eventState.keyImages.event.nw, 1600, `${run.viewport.name} event width should match asset`);
}

console.log('task 34 new asset render QA checks passed');
