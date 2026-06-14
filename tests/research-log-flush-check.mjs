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

const logger = await import('../src/research/logger.js?flush-test=' + Date.now());

const session = {
  session_id: 'session-001',
  participant_code: 'YW-001',
  app_version: 'lkkc-pilot-v1.0',
  research_cohort: 'lkkc-may-june-2026',
  content_map_version: 'content-freeze-lite-v0.1'
};

logger.clearQueuedResearchEvents();
logger.logResearchEvent('city_entered', { route_id: 'lihongzhang', city_id: 'shanghai' });
logger.logResearchEvent('decision_selected', { choice_id: 'a', choice_label: 'should not be sent by server' });

let submitted = null;
const success = await logger.flushQueuedResearchEvents(session, async (events, passedSession) => {
  submitted = { events, session: passedSession };
  return { ok: true, status: 200, data: { accepted: true, inserted_count: events.length } };
});

assert.equal(success.flushed, true, 'Successful flush should report flushed=true');
assert.equal(success.inserted_count, 2, 'Successful flush should expose inserted_count');
assert.equal(submitted.session.session_id, 'session-001', 'Flush should submit the active research session');
assert.deepEqual(submitted.events.map((event) => event.event_type), ['city_entered', 'decision_selected']);
assert.equal(logger.getQueuedResearchEvents().length, 0, 'Successful flush should clear the queue');

logger.logResearchEvent('event_opened', { event_id: 'e_jiangnan' });
const failed = await logger.flushQueuedResearchEvents(session, async () => {
  return { ok: false, status: 503, data: { error: 'backend_unavailable' } };
});

assert.equal(failed.flushed, false, 'Failed flush should report flushed=false');
assert.equal(failed.error, 'backend_unavailable', 'Failed flush should surface the public API error');
assert.equal(logger.getQueuedResearchEvents().length, 1, 'Failed flush should keep queued events for retry');

logger.clearQueuedResearchEvents();
logger.logResearchEvent('event_opened', { event_id: 'e_zongli_yamen' });
const overlap = await logger.flushQueuedResearchEvents(session, async () => {
  logger.logResearchEvent('decision_selected', { choice_id: 'a' });
  return { ok: true, status: 200, data: { accepted: true, inserted_count: 1 } };
});
assert.equal(overlap.flushed, true, 'Successful flush should still report flushed=true');
assert.deepEqual(
  logger.getQueuedResearchEvents().map((event) => event.event_type),
  ['decision_selected'],
  'Events queued during an in-flight flush should remain queued for the next flush'
);

logger.clearQueuedResearchEvents();
const empty = await logger.flushQueuedResearchEvents(session, async () => {
  throw new Error('submitter should not be called for empty queue');
});
assert.equal(empty.flushed, true, 'Empty queue should be treated as already flushed');
assert.equal(empty.inserted_count, 0, 'Empty queue should report zero inserted events');

logger.clearQueuedResearchEvents();
let autoSubmitted = null;
logger.configureResearchEventFlush({
  session,
  submitLogBatch: async (events, passedSession) => {
    autoSubmitted = { events, session: passedSession };
    return { ok: true, status: 200, data: { accepted: true, inserted_count: events.length } };
  },
  debounceMs: 0
});

logger.logResearchEvent('city_entered', { route_id: 'lihongzhang', city_id: 'beijing' });
await new Promise((resolve) => setTimeout(resolve, 5));
assert.equal(autoSubmitted.session.session_id, 'session-001', 'Configured auto flush should use the active research session');
assert.deepEqual(autoSubmitted.events.map((event) => event.event_type), ['city_entered']);
assert.equal(logger.getQueuedResearchEvents().length, 0, 'Successful auto flush should clear the queue after gameplay events');
logger.stopResearchEventFlush();

console.log('research log flush checks passed');
