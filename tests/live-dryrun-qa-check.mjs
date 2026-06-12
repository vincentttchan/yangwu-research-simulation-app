import assert from 'node:assert/strict';

const baseUrl = process.env.DRYRUN_QA_BASE_URL || '';
const requireLiveQa = process.env.REQUIRE_LIVE_DRYRUN_QA === 'true';

function normaliseBaseUrl(value) {
  if (!value) return '';
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, '');
}

async function postJson(path, body) {
  const response = await fetch(`${normaliseBaseUrl(baseUrl)}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

function loginPayload(participantCode, sessionCode) {
  return {
    participant_code: participantCode,
    session_code: sessionCode,
    app_version: 'dev-v0.1',
    research_cohort: 'lkkc-may-june-2026',
    content_map_version: 'content-freeze-lite-v0.1',
    device: {
      category: 'qa',
      viewport_width: 1024,
      viewport_height: 768,
      browser_family: 'live-dryrun-qa'
    }
  };
}

if (!baseUrl) {
  const message = 'live dry-run QA skipped: set DRYRUN_QA_BASE_URL to a Vercel Preview URL or local Vercel dev URL';
  if (requireLiveQa) {
    throw new Error(message);
  }
  console.log(message);
  process.exit(0);
}

assert.doesNotMatch(baseUrl, /SUPABASE|SECRET|KEY|sb_secret|service_role/i, 'DRYRUN_QA_BASE_URL must be a deployment URL, not a secret');

{
  const result = await postJson('/api/login', loginPayload('', ''));
  assert.equal(result.status, 400, 'Missing codes should return 400');
  assert.equal(result.data.error, 'missing_codes');
}

let validSession = null;

{
  const result = await postJson('/api/login', loginPayload('YW-001', 'LKKC-2026-DRYRUN'));
  assert.equal(result.status, 200, 'YW-001 dry-run login should succeed');
  assert.equal(result.data.session.participant_code, 'YW-001');
  assert.equal(result.data.session.class_id, 'LKKC-S4A');
  assert.equal(result.data.session.condition, 'scaffolded');
  assert.equal(Object.hasOwn(result.data.session, 'notes'), false);
  assert.equal(Object.hasOwn(result.data.session, 'session_code'), false);
  validSession = result.data.session;
}

{
  const result = await postJson('/api/login', loginPayload('YW-999', 'LKKC-2026-DRYRUN'));
  assert.equal(result.status, 403, 'Excluded dry-run participant should be rejected');
  assert.equal(result.data.error, 'invalid_or_excluded_participant');
}

{
  const result = await postJson('/api/login', loginPayload('YW-001', 'WRONG-SESSION'));
  assert.equal(result.status, 403, 'Wrong session code should be rejected');
  assert.equal(result.data.error, 'invalid_or_excluded_participant');
}

{
  const result = await postJson('/api/logs-batch', {
    session: validSession,
    events: [{
      client_event_id: `live-qa-${Date.now()}`,
      event_type: 'live_dryrun_qa',
      payload: {
        route_id: 'qa',
        city_id: 'qa',
        source: 'live-dryrun-qa',
        choice_id: 'qa',
        choice_label: 'must be removed by server sanitizer'
      },
      constructs: ['historical_complexity', 'evidence_use', 'historical_complexity'],
      complexity_dimensions: ['technology', 'institutions'],
      client_time: new Date().toISOString(),
      app_version: 'dev-v0.1',
      research_cohort: 'lkkc-may-june-2026',
      content_map_version: 'content-freeze-lite-v0.1'
    }]
  });
  assert.equal(result.status, 200, 'Log batch should accept a safe dry-run event');
  assert.equal(result.data.accepted, true);
  assert.equal(result.data.inserted_count, 1);
}

console.log(`live dry-run QA checks passed for ${normaliseBaseUrl(baseUrl)}`);
