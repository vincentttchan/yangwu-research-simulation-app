import { EVENT_TYPES } from './event-taxonomy.js';
import { logResearchEvent } from './logger.js';
import { RESEARCH_CONTENT_MAP, RESEARCH_ID_POLICY } from './content-map.js';

function compact(value) {
  const out = {};
  Object.entries(value || {}).forEach(([key, entry]) => {
    if (entry !== undefined && entry !== null && entry !== '') out[key] = entry;
  });
  return out;
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

export function buildResearchPayload({
  routeId,
  cityId,
  eventId,
  evidenceTaskId,
  extra = {}
} = {}) {
  const route = routeId ? RESEARCH_CONTENT_MAP.routes[routeId] : null;
  const city = cityId ? RESEARCH_CONTENT_MAP.cities[cityId] : null;
  const event = eventId ? RESEARCH_CONTENT_MAP.events[eventId] : null;
  const evidenceTask = evidenceTaskId ? RESEARCH_CONTENT_MAP.evidenceTasks[evidenceTaskId] : null;
  const resolvedCityId = cityId || evidenceTask?.cityId || event?.cityId || null;
  const constructs = unique([
    ...(route?.constructs || []),
    ...(city?.constructs || []),
    ...(event?.constructs || []),
    ...(evidenceTask?.constructs || [])
  ]);
  const complexityDimensions = unique([
    ...(route?.complexityDimensions || []),
    ...(city?.complexityDimensions || []),
    ...(event?.complexityDimensions || []),
    ...(evidenceTask?.complexityDimensions || [])
  ]);

  return compact({
    route_id: routeId,
    city_id: resolvedCityId,
    event_id: eventId,
    event_kind: event?.eventKind,
    evidence_task_id: evidenceTaskId,
    hotspot_id: evidenceTask?.hotspotId,
    constructs,
    complexity_dimensions: complexityDimensions,
    research_id_policy: RESEARCH_ID_POLICY.version,
    ...extra
  });
}

function logMappedEvent(eventType, idsAndExtra) {
  return logResearchEvent(eventType, buildResearchPayload(idsAndExtra));
}

export function logSessionStart({ routeId, isNewGame, year, season } = {}) {
  return logMappedEvent(EVENT_TYPES.SESSION_START, {
    routeId,
    extra: {
      is_new_game: isNewGame,
      year,
      season
    }
  });
}

export function logCityEntered({ routeId, cityId, year, season, travelSeasons } = {}) {
  return logMappedEvent(EVENT_TYPES.CITY_ENTERED, {
    routeId,
    cityId,
    extra: {
      year,
      season,
      travel_seasons: travelSeasons
    }
  });
}

export function logEvidenceTaskCompleted({
  routeId,
  cityId,
  hotspotId,
  evidenceTaskId,
  eventId,
  taskType,
  newlyCollected
} = {}) {
  return logMappedEvent(EVENT_TYPES.EVIDENCE_TASK_COMPLETED, {
    routeId,
    cityId,
    eventId,
    evidenceTaskId,
    extra: {
      hotspot_id: hotspotId,
      task_type: taskType,
      newly_collected: newlyCollected
    }
  });
}

export function logEventOpened({ routeId, cityId, eventId, source, year, season } = {}) {
  return logMappedEvent(EVENT_TYPES.EVENT_OPENED, {
    routeId,
    cityId,
    eventId,
    extra: {
      source,
      year,
      season
    }
  });
}

export function logDecisionSelected({
  routeId,
  cityId,
  eventId,
  choiceId,
  choiceIndex,
  choiceAxis,
  hasEffects
} = {}) {
  return logMappedEvent(EVENT_TYPES.DECISION_SELECTED, {
    routeId,
    cityId,
    eventId,
    extra: {
      choice_id: choiceId,
      choice_index: choiceIndex,
      choice_axis: choiceAxis,
      has_effects: hasEffects
    }
  });
}

export function logSessionEnd({
  routeId,
  year,
  season,
  completedEventsCount,
  citiesVisitedCount,
  evidenceCount,
  challengeCorrect
} = {}) {
  return logMappedEvent(EVENT_TYPES.SESSION_END, {
    routeId,
    extra: {
      year,
      season,
      completed_events_count: completedEventsCount,
      cities_visited_count: citiesVisitedCount,
      evidence_count: evidenceCount,
      challenge_correct: challengeCorrect
    }
  });
}

window.__yangwuResearch = {
  logSessionStart,
  logCityEntered,
  logEvidenceTaskCompleted,
  logEventOpened,
  logDecisionSelected,
  logSessionEnd,
  buildResearchPayload
};

document.documentElement.dataset.researchInstrumentation = 'local-flow-v1';
