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
  app_version: 'dev-v0.1',
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
const empty = await logger.flushQueuedResearchEvents(session, async () => {
  throw new Error('submitter should not be called for empty queue');
});
assert.equal(empty.flushed, true, 'Empty queue should be treated as already flushed');
assert.equal(empty.inserted_count, 0, 'Empty queue should report zero inserted events');

console.log('research log flush checks passed');
