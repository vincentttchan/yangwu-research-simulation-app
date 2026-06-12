import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  RESEARCH_CONTENT_MAP,
  RESEARCH_ID_POLICY,
  RESEARCH_CONSTRUCTS
} from '../src/research/content-map.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const intro = readFileSync(join(root, 'src', 'intro.js'), 'utf8');
const docsPath = join(root, 'docs', 'research-id-map.md');

function extractObjectBlock(name) {
  const marker = `const ${name} = {`;
  const start = intro.indexOf(marker);
  assert.notEqual(start, -1, `Missing object block: ${name}`);
  let openIndex = intro.indexOf('{', start);
  let depth = 0;
  for (let i = openIndex; i < intro.length; i += 1) {
    if (intro[i] === '{') depth += 1;
    if (intro[i] === '}') {
      depth -= 1;
      if (depth === 0) return intro.slice(start, i + 1);
    }
  }
  throw new Error(`Unclosed object block: ${name}`);
}

function objectKeys(name) {
  const block = extractObjectBlock(name);
  const bareKeys = [...block.matchAll(/^ {4}([A-Za-z0-9_]+):\s*\{/gm)].map((match) => match[1]);
  const quotedKeys = [...block.matchAll(/^ {4}'([^']+)':\s*\{/gm)].map((match) => match[1]);
  return [...new Set([...bareKeys, ...quotedKeys])].sort();
}

const allowedConstructs = new Set(Object.values(RESEARCH_CONSTRUCTS));
const introRoutes = objectKeys('ROUTE_MAP_DATA');
const introCities = objectKeys('CITY_SCENES');
const introEvents = objectKeys('EVENTS');
const introEvidenceTasks = objectKeys('EVIDENCE_TASKS');

assert.equal(RESEARCH_ID_POLICY.version, 'content-freeze-lite-v0.1', 'Research ID map should have a clear freeze-lite version');
assert.equal(RESEARCH_ID_POLICY.freezesIdsOnly, true, 'Freeze-lite should freeze IDs only');
assert.equal(RESEARCH_ID_POLICY.freezesWordingOrVisuals, false, 'Freeze-lite should not freeze wording or visuals');

assert.deepEqual(Object.keys(RESEARCH_CONTENT_MAP.routes).sort(), introRoutes, 'Every game route should be registered in the research map');
assert.deepEqual(Object.keys(RESEARCH_CONTENT_MAP.cities).sort(), introCities, 'Every city scene should be registered in the research map');
assert.deepEqual(Object.keys(RESEARCH_CONTENT_MAP.events).sort(), introEvents, 'Every game event should be registered in the research map');
assert.deepEqual(Object.keys(RESEARCH_CONTENT_MAP.evidenceTasks).sort(), introEvidenceTasks, 'Every evidence task should be registered in the research map');

for (const [cityId, city] of Object.entries(RESEARCH_CONTENT_MAP.cities)) {
  assert.equal(city.id, cityId, `City map entry ${cityId} should repeat its stable ID`);
  assert.ok(Array.isArray(city.constructs) && city.constructs.length > 0, `City ${cityId} should have research constructs`);
  city.constructs.forEach((construct) => assert.ok(allowedConstructs.has(construct), `Unknown city construct: ${construct}`));
}

for (const [eventId, event] of Object.entries(RESEARCH_CONTENT_MAP.events)) {
  assert.equal(event.id, eventId, `Event map entry ${eventId} should repeat its stable ID`);
  assert.ok(RESEARCH_CONTENT_MAP.cities[event.cityId], `Event ${eventId} should point to a registered city`);
  assert.ok(['pinned', 'city_event', 'terminal', 'comparison'].includes(event.eventKind), `Event ${eventId} should have a valid event kind`);
  assert.ok(Array.isArray(event.constructs) && event.constructs.length > 0, `Event ${eventId} should have research constructs`);
  event.constructs.forEach((construct) => assert.ok(allowedConstructs.has(construct), `Unknown event construct: ${construct}`));
}

for (const [taskId, task] of Object.entries(RESEARCH_CONTENT_MAP.evidenceTasks)) {
  assert.equal(task.id, taskId, `Evidence task ${taskId} should repeat its stable ID`);
  assert.match(taskId, /^[a-z]+:[a-z0-9-]+$/, `Evidence task ${taskId} should use city:hotspot format`);
  assert.equal(task.cityId, taskId.split(':')[0], `Evidence task ${taskId} should derive cityId from its ID`);
  assert.ok(RESEARCH_CONTENT_MAP.cities[task.cityId], `Evidence task ${taskId} should point to a registered city`);
  assert.ok(Array.isArray(task.constructs) && task.constructs.length > 0, `Evidence task ${taskId} should have research constructs`);
  task.constructs.forEach((construct) => assert.ok(allowedConstructs.has(construct), `Unknown task construct: ${construct}`));
}

assert.equal(existsSync(docsPath), true, 'Research ID map documentation should exist');
const docs = readFileSync(docsPath, 'utf8');
assert.match(docs, /Content Freeze Lite/, 'Documentation should name the freeze-lite policy');
assert.match(docs, /does not freeze wording, images, layout, or visual polish/i, 'Documentation should keep design iteration open');
assert.match(docs, /yangwu_research_event_queue_v1/, 'Documentation should connect the map to the current local research logger');
assert.match(docs, new RegExp(`Routes: ${introRoutes.length}`), 'Documentation should report route count');
assert.match(docs, new RegExp(`Cities: ${introCities.length}`), 'Documentation should report city count');
assert.match(docs, new RegExp(`Events: ${introEvents.length}`), 'Documentation should report event count');
assert.match(docs, new RegExp(`Evidence tasks: ${introEvidenceTasks.length}`), 'Documentation should report evidence task count');

console.log('research content map checks passed');
