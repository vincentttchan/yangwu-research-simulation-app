import { APP_VERSION, RESEARCH_COHORT } from './version.js';

const QUEUE_KEY = 'yangwu_research_event_queue_v1';
const MAX_QUEUE_SIZE = 300;
const DEFAULT_AUTO_FLUSH_DEBOUNCE_MS = 1200;

let activeFlushConfig = null;
let autoFlushTimer = null;
let autoFlushPromise = null;
let lifecycleWindow = null;
let lifecycleDocument = null;
let lifecyclePagehideHandler = null;
let lifecycleVisibilityHandler = null;

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

function makeClientEventId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function removeSubmittedEvents(submittedEvents) {
  const submittedIds = new Set(
    submittedEvents
      .map((event) => event?.client_event_id)
      .filter(Boolean)
  );

  const currentQueue = readQueue();
  if (submittedIds.size) {
    writeQueue(currentQueue.filter((event) => !submittedIds.has(event?.client_event_id)));
    return;
  }

  writeQueue(currentQueue.slice(submittedEvents.length));
}

function scheduleActiveFlush(delayMs = DEFAULT_AUTO_FLUSH_DEBOUNCE_MS) {
  if (!activeFlushConfig) return;
  if (autoFlushTimer) clearTimeout(autoFlushTimer);
  autoFlushTimer = setTimeout(() => {
    autoFlushTimer = null;
    void flushActiveResearchEvents();
  }, Math.max(0, Number(delayMs) || 0));
}

async function flushActiveResearchEvents() {
  if (!activeFlushConfig) return { flushed: false, error: 'missing_active_flush_config' };
  if (autoFlushPromise) return autoFlushPromise;

  autoFlushPromise = flushQueuedResearchEvents(
    activeFlushConfig.session,
    activeFlushConfig.submitLogBatch
  ).then((result) => {
    if (result?.flushed && readQueue().length) {
      scheduleActiveFlush(0);
    }
    return result;
  }).finally(() => {
    autoFlushPromise = null;
  });

  return autoFlushPromise;
}

function unbindLifecycleFlush() {
  if (lifecycleWindow && lifecyclePagehideHandler) {
    lifecycleWindow.removeEventListener?.('pagehide', lifecyclePagehideHandler);
  }
  if (lifecycleDocument && lifecycleVisibilityHandler) {
    lifecycleDocument.removeEventListener?.('visibilitychange', lifecycleVisibilityHandler);
  }
  lifecycleWindow = null;
  lifecycleDocument = null;
  lifecyclePagehideHandler = null;
  lifecycleVisibilityHandler = null;
}

function bindLifecycleFlush(windowRef, documentRef) {
  unbindLifecycleFlush();
  lifecycleWindow = windowRef || null;
  lifecycleDocument = documentRef || null;

  lifecyclePagehideHandler = () => {
    void flushActiveResearchEvents();
  };
  lifecycleVisibilityHandler = () => {
    if (!lifecycleDocument || lifecycleDocument.hidden) {
      void flushActiveResearchEvents();
    }
  };

  lifecycleWindow?.addEventListener?.('pagehide', lifecyclePagehideHandler);
  lifecycleDocument?.addEventListener?.('visibilitychange', lifecycleVisibilityHandler);
}

export function logResearchEvent(eventType, payload = {}) {
  const event = {
    client_event_id: makeClientEventId(),
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

  scheduleActiveFlush(activeFlushConfig?.debounceMs);

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
      removeSubmittedEvents(queue);
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

export function configureResearchEventFlush({
  session,
  submitLogBatch,
  debounceMs = DEFAULT_AUTO_FLUSH_DEBOUNCE_MS,
  windowRef = typeof window !== 'undefined' ? window : null,
  documentRef = typeof document !== 'undefined' ? document : null
} = {}) {
  if (!session?.session_id || !session?.participant_code || typeof submitLogBatch !== 'function') {
    activeFlushConfig = null;
    return { configured: false, error: 'missing_session_or_submitter' };
  }

  activeFlushConfig = { session, submitLogBatch, debounceMs };
  bindLifecycleFlush(windowRef, documentRef);
  documentRef?.documentElement?.dataset && (documentRef.documentElement.dataset.researchAutoFlush = 'active');
  return { configured: true };
}

export function stopResearchEventFlush() {
  if (autoFlushTimer) clearTimeout(autoFlushTimer);
  autoFlushTimer = null;
  activeFlushConfig = null;
  unbindLifecycleFlush();
  if (typeof document !== 'undefined') {
    document.documentElement?.dataset && (document.documentElement.dataset.researchAutoFlush = 'inactive');
  }
}

window.__researchLog = {
  log: logResearchEvent,
  queued: getQueuedResearchEvents,
  clear: clearQueuedResearchEvents,
  flush: flushQueuedResearchEvents,
  configureFlush: configureResearchEventFlush,
  stopFlush: stopResearchEventFlush
};

document.documentElement.dataset.researchLogger = 'local-v1';
document.documentElement.dataset.researchQueueKey = QUEUE_KEY;
