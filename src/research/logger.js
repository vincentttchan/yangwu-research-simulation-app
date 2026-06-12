import { APP_VERSION, RESEARCH_COHORT } from './version.js';

const QUEUE_KEY = 'yangwu_research_event_queue_v1';
const MAX_QUEUE_SIZE = 300;

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)));
  } catch (error) {
    console.warn('[research-log] queue write failed', error);
  }
}

export function logResearchEvent(eventType, payload = {}) {
  const event = {
    event_type: String(eventType || 'unknown_event'),
    payload,
    client_time: new Date().toISOString(),
    app_version: APP_VERSION,
    research_cohort: RESEARCH_COHORT
  };

  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);

  if (window.__RESEARCH_DEBUG) {
    console.info('[research-log]', event);
  }

  return event;
}

export function getQueuedResearchEvents() {
  return readQueue();
}

export function clearQueuedResearchEvents() {
  writeQueue([]);
}

export async function flushQueuedResearchEvents(session, submitLogBatch) {
  const queue = readQueue();
  if (!queue.length) {
    return { flushed: true, inserted_count: 0 };
  }

  if (!session?.session_id || !session?.participant_code || typeof submitLogBatch !== 'function') {
    return { flushed: false, error: 'missing_session_or_submitter' };
  }

  try {
    const result = await submitLogBatch(queue, session);
    if (result?.ok && result.data?.accepted) {
      clearQueuedResearchEvents();
      return {
        flushed: true,
        inserted_count: Number(result.data.inserted_count || 0)
      };
    }

    return {
      flushed: false,
      error: result?.data?.error || 'log_flush_failed'
    };
  } catch (error) {
    return {
      flushed: false,
      error: 'log_flush_failed'
    };
  }
}

window.__researchLog = {
  log: logResearchEvent,
  queued: getQueuedResearchEvents,
  clear: clearQueuedResearchEvents,
  flush: flushQueuedResearchEvents
};

document.documentElement.dataset.researchLogger = 'local-v1';
document.documentElement.dataset.researchQueueKey = QUEUE_KEY;
