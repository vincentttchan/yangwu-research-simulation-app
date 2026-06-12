import { createServerSupabaseClient } from './_supabase.js';

function normaliseCode(value) {
  return String(value || '').trim().toUpperCase();
}

function cleanText(value) {
  const text = String(value || '').trim();
  return text || null;
}

function cleanDevice(device) {
  if (!device || typeof device !== 'object') return {};

  return {
    device_category: cleanText(device.category),
    viewport_width: Number.isFinite(Number(device.viewport_width)) ? Number(device.viewport_width) : null,
    viewport_height: Number.isFinite(Number(device.viewport_height)) ? Number(device.viewport_height) : null,
    browser_family: cleanText(device.browser_family)
  };
}

function disconnectedResult() {
  return {
    status: 501,
    body: {
      error: 'supabase_not_connected',
      message: 'Login API is prepared; set RESEARCH_BACKEND_ENABLED=dry_run with server-side Supabase env vars for dry-run validation.'
    }
  };
}

function missingCodesResult() {
  return {
    status: 400,
    body: { error: 'missing_codes' }
  };
}

function invalidParticipantResult() {
  return {
    status: 403,
    body: { error: 'invalid_or_excluded_participant' }
  };
}

function backendErrorResult() {
  return {
    status: 503,
    body: { error: 'backend_unavailable' }
  };
}

function publicSessionFrom(participant, sessionRow, body) {
  return {
    session_id: sessionRow.session_id,
    participant_code: participant.participant_code,
    class_id: participant.class_id,
    condition: participant.condition,
    app_version: sessionRow.app_version || cleanText(body.app_version),
    research_cohort: sessionRow.research_cohort || cleanText(body.research_cohort),
    content_map_version: sessionRow.content_map_version || cleanText(body.content_map_version)
  };
}

export async function resolveLoginResult(body = {}, options = {}) {
  const env = options.env || process.env;
  const participantCode = normaliseCode(body.participant_code);
  const sessionCode = normaliseCode(body.session_code);

  if (!participantCode || !sessionCode) return missingCodesResult();

  const supabase = options.supabase === undefined
    ? createServerSupabaseClient(env)
    : options.supabase;

  if (!supabase || env.RESEARCH_BACKEND_ENABLED !== 'dry_run') {
    return disconnectedResult();
  }

  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .select('participant_code, session_code, class_id, condition, consent_status')
    .eq('participant_code', participantCode)
    .eq('session_code', sessionCode)
    .maybeSingle();

  if (participantError) return backendErrorResult();

  if (!participant || participant.consent_status !== 'included') {
    return invalidParticipantResult();
  }

  const device = cleanDevice(body.device);
  const sessionInsert = {
    participant_code: participant.participant_code,
    app_version: cleanText(body.app_version) || env.APP_VERSION || 'dev-v0.1',
    research_cohort: cleanText(body.research_cohort) || env.RESEARCH_COHORT || 'lkkc-may-june-2026',
    content_map_version: cleanText(body.content_map_version),
    device_category: device.device_category,
    viewport_width: device.viewport_width,
    viewport_height: device.viewport_height,
    browser_family: device.browser_family,
    completion_status: 'started'
  };

  const { data: sessionRow, error: sessionError } = await supabase
    .from('game_sessions')
    .insert(sessionInsert)
    .select('session_id, participant_code, app_version, research_cohort, content_map_version')
    .single();

  if (sessionError || !sessionRow?.session_id) return backendErrorResult();

  return {
    status: 200,
    body: {
      session: publicSessionFrom(participant, sessionRow, body)
    }
  };
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const result = await resolveLoginResult(request.body || {});
  response.status(result.status).json(result.body);
}
