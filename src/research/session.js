const SESSION_KEY = 'yangwu_research_session_v1';

function compactSession(session) {
  if (!session || typeof session !== 'object') return null;
  return {
    session_id: session.session_id || null,
    participant_code: session.participant_code || null,
    class_id: session.class_id || null,
    condition: session.condition || null,
    app_version: session.app_version || null,
    research_cohort: session.research_cohort || null,
    content_map_version: session.content_map_version || null
  };
}

export function saveResearchSession(session) {
  const compact = compactSession(session);
  if (!compact?.session_id || !compact?.participant_code) return null;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(compact));
    return compact;
  } catch (error) {
    return null;
  }
}

export function loadResearchSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch (error) {
    return null;
  }
}

export function clearResearchSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    // Storage can be unavailable or blocked; clearing should remain best-effort.
  }
}

window.__researchSession = {
  save: saveResearchSession,
  load: loadResearchSession,
  clear: clearResearchSession
};

document.documentElement.dataset.researchSession = 'session-v1';
document.documentElement.dataset.researchSessionKey = SESSION_KEY;
