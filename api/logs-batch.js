import { createServerSupabaseClient } from './_supabase.js';

const MAX_EVENTS_PER_BATCH = 100;
const SAFE_PAYLOAD_KEYS = new Set([
  'route_id',
  'city_id',
  'event_id',
  'event_kind',
  'evidence_task_id',
  'hotspot_id',
  'research_id_policy',
  'source',
  'year',
  'season',
  'travel_seasons',
  'is_new_game',
  'task_type',
  'newly_collected',
  'choice_id',
  'choice_index',
  'choice_axis',
  'has_effects',
  'completed_events_count',
  'cities_visited_count',
  'evidence_count',
  'challenge_correct'
]);

function cleanText(value, maxLength = 120) {
  const text = String(value || '').trim();
  if (!text) return null;
  return text.slice(0, maxLength);
}

function cleanArray(value, maxItems = 12) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((entry) => cleanText(entry, 80)).filter(Boolean))].slice(0, maxItems);
}

function cleanPayload(payload = {}) {
  const out = {};
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (!SAFE_PAYLOAD_KEYS.has(key)) return;
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) return;
    if (typeof value === 'object') return;
    out[key] = typeof value === 'string' ? cleanText(value, 160) : value;
  });
  return out;
}

function disconnectedResult() {
  return {
    status: 501,
    body: {
      error: 'supabase_not_connected',
      message: 'Log batch API is prepared; set RESEARCH_BACKEND_ENABLED=dry_run with server-side Supabase env vars for dry-run validation.'
    }
  };
}

function invalidBatchResult() {
  return {
    status: 400,
    body: { error: 'invalid_log_batch' }
  };
}

function backendErrorResult(error) {
  if (error) {
    console.error('[research-logs] backend unavailable', {
      code: error.code || null,
      message: error.message || null,
      details: error.details || null,
      hint: error.hint || null
    });
  }

  return {
    status: 503,
    body: { error: 'backend_unavailable' }
  };
}

function publicResult(insertedCount) {
  return {
    status: 200,
    body: {
      accepted: true,
      inserted_count: insertedCount
    }
  };
}

function isValidSession(session) {
  return Boolean(session?.session_id && session?.participant_code);
}

function logRowFromEvent(event, session, env) {
  const payload = event?.payload && typeof event.payload === 'object' ? event.payload : {};
  const eventType = cleanText(event?.event_type || 'unknown_event', 80);

  if (!eventType) return null;

  return {
    client_event_id: cleanText(event?.client_event_id, 160),
    session_id: session.session_id,
    participant_code: session.participant_code,
    event_type: eventType,
    payload: cleanPayload(payload),
    constructs: cleanArray(event?.constructs || payload.constructs),
    complexity_dimensions: cleanArray(event?.complexity_dimensions || payload.complexity_dimensions),
    client_time: cleanText(event?.client_time, 80),
    app_version: cleanText(event?.app_version) || cleanText(session.app_version) || env.APP_VERSION || 'dev-v0.1',
    research_cohort: cleanText(event?.research_cohort) || cleanText(session.research_cohort) || env.RESEARCH_COHORT || 'lkkc-may-june-2026',
    content_map_version: cleanText(event?.content_map_version) || cleanText(session.content_map_version)
  };
}

export async function resolveLogBatchResult(body = {}, options = {}) {
  const env = options.env || process.env;
  const { session, events } = body || {};

  if (!isValidSession(session) || !Array.isArray(events)) return invalidBatchResult();

  const supabase = options.supabase === undefined
    ? createServerSupabaseClient(env)
    : options.supabase;

  if (!supabase || env.RESEARCH_BACKEND_ENABLED !== 'dry_run') {
    return disconnectedResult();
  }

  const rows = events
    .slice(0, MAX_EVENTS_PER_BATCH)
    .map((event) => logRowFromEvent(event, session, env))
    .filter(Boolean);

  if (!rows.length) return publicResult(0);

  const { data, error } = await supabase
    .from('event_logs')
    .insert(rows)
    .select('log_id');

  if (error) return backendErrorResult(error);

  return publicResult(Array.isArray(data) ? data.length : rows.length);
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const result = await resolveLogBatchResult(request.body || {});
  response.status(result.status).json(result.body);
}
