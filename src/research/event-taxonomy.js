export const EVENT_TYPES = Object.freeze({
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  CITY_ENTERED: 'city_entered',
  SOURCE_OPENED: 'source_opened',
  EVIDENCE_TASK_COMPLETED: 'evidence_task_completed',
  EVENT_OPENED: 'event_opened',
  DECISION_SELECTED: 'decision_selected',
  DECISION_REVISED: 'decision_revised',
  CHECKPOINT_OPENED: 'checkpoint_opened',
  CHECKPOINT_SUBMITTED: 'checkpoint_submitted',
  TRANSFER_SUBMITTED: 'transfer_submitted',
  ERROR_REPORTED: 'error_reported'
});

window.__researchEventTypes = EVENT_TYPES;

document.documentElement.dataset.researchEventTaxonomy = 'yangwu-v1';
