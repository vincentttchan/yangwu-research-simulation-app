import { APP_VERSION, RESEARCH_COHORT } from './version.js';
import { RESEARCH_ID_POLICY } from './content-map.js';

async function postJson(path, body) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function getDeviceSnapshot() {
  const width = window.innerWidth || 0;
  const height = window.innerHeight || 0;
  let category = 'desktop';
  if (width <= 700) category = 'mobile';
  else if (width <= 1100) category = 'tablet';

  return {
    category,
    viewport_width: width,
    viewport_height: height,
    browser_family: navigator.userAgentData?.brands?.[0]?.brand || null
  };
}

export function loginWithParticipantCode(participantCode, sessionCode) {
  return postJson('/api/login', {
    participant_code: String(participantCode || '').trim(),
    session_code: String(sessionCode || '').trim(),
    app_version: APP_VERSION,
    research_cohort: RESEARCH_COHORT,
    content_map_version: RESEARCH_ID_POLICY.version,
    device: getDeviceSnapshot()
  });
}

export function submitLogBatch(events, session) {
  return postJson('/api/logs-batch', {
    session,
    events
  });
}

export const __researchApiForTests = {
  postJson,
  getDeviceSnapshot
};
