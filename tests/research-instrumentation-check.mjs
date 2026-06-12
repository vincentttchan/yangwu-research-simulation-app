import assert from 'node:assert/strict';

const store = new Map();
globalThis.window = {};
globalThis.document = { documentElement: { dataset: {} } };
globalThis.localStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  setItem(key, value) {
    store.set(key, String(value));
  }
};

const logger = await import('../src/research/logger.js?instrumentation-test=' + Date.now());
const instrumentation = await import('../src/research/instrumentation.js?instrumentation-test=' + Date.now());

logger.clearQueuedResearchEvents();

assert.equal(document.documentElement.dataset.researchInstrumentation, 'local-flow-v1', 'Instrumentation should expose a browser-readable QA marker');
assert.equal(typeof window.__yangwuResearch.logSessionStart, 'function', 'Instrumentation should expose session logger');
assert.equal(typeof window.__yangwuResearch.logCityEntered, 'function', 'Instrumentation should expose city logger');
assert.equal(typeof window.__yangwuResearch.logEvidenceTaskCompleted, 'function', 'Instrumentation should expose evidence logger');
assert.equal(typeof window.__yangwuResearch.logEventOpened, 'function', 'Instrumentation should expose event logger');
assert.equal(typeof window.__yangwuResearch.logDecisionSelected, 'function', 'Instrumentation should expose decision logger');
assert.equal(typeof window.__yangwuResearch.logSessionEnd, 'function', 'Instrumentation should expose session end logger');

const enriched = instrumentation.buildResearchPayload({
  routeId: 'lihongzhang',
  cityId: 'shanghai',
  eventId: 'e_jiangnan',
  evidenceTaskId: 'shanghai:sh-stack',
  extra: { trigger: 'test' }
});

assert.equal(enriched.route_id, 'lihongzhang');
assert.equal(enriched.city_id, 'shanghai');
assert.equal(enriched.event_id, 'e_jiangnan');
assert.equal(enriched.evidence_task_id, 'shanghai:sh-stack');
assert.equal(enriched.event_kind, 'city_event');
assert.equal(enriched.hotspot_id, 'sh-stack');
assert.ok(enriched.constructs.includes('evidence_use'));
assert.ok(enriched.constructs.includes('historical_complexity'));
assert.ok(enriched.complexity_dimensions.includes('technology'), 'Jiangnan/shanghai payload should identify technology exposure');
assert.ok(enriched.complexity_dimensions.includes('institutions'), 'Jiangnan/shanghai payload should identify institutional exposure');
assert.equal(enriched.trigger, 'test');

window.__yangwuResearch.logSessionStart({ routeId: 'lihongzhang', isNewGame: true, year: 1861, season: 0 });
window.__yangwuResearch.logCityEntered({ routeId: 'lihongzhang', cityId: 'shanghai', year: 1861, season: 0, travelSeasons: 0 });
window.__yangwuResearch.logEvidenceTaskCompleted({ routeId: 'lihongzhang', cityId: 'shanghai', hotspotId: 'sh-stack', evidenceTaskId: 'shanghai:sh-stack', eventId: 'e_jiangnan', newlyCollected: true });
window.__yangwuResearch.logEventOpened({ routeId: 'lihongzhang', cityId: 'shanghai', eventId: 'e_jiangnan', source: 'city' });
window.__yangwuResearch.logDecisionSelected({ routeId: 'lihongzhang', cityId: 'shanghai', eventId: 'e_jiangnan', choiceId: 'a', choiceIndex: 0, choiceAxis: 'material' });
window.__yangwuResearch.logSessionEnd({ routeId: 'lihongzhang', year: 1895, completedEventsCount: 3, citiesVisitedCount: 2 });

const queued = logger.getQueuedResearchEvents();
assert.deepEqual(queued.map((event) => event.event_type), [
  'session_start',
  'city_entered',
  'evidence_task_completed',
  'event_opened',
  'decision_selected',
  'session_end'
]);
assert.equal(queued[2].payload.evidence_task_id, 'shanghai:sh-stack');
assert.equal(queued[2].payload.hotspot_id, 'sh-stack');
assert.equal(queued[3].payload.event_kind, 'city_event');
assert.equal(queued[4].payload.choice_id, 'a');
assert.equal(queued[4].payload.choice_label, undefined, 'Decision logging should not store visible choice prose');
assert.ok(queued[4].payload.complexity_dimensions.includes('technology'), 'Decision logs should carry historical complexity dimensions for analysis');

console.log('research instrumentation checks passed');
