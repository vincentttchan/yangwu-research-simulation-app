import assert from 'node:assert/strict';

const mod = await import('../api/research-env-diagnostic.js?task26=' + Date.now());

assert.equal(typeof mod.buildResearchEnvDiagnostic, 'function');

const diagnostic = mod.buildResearchEnvDiagnostic({
  RESEARCH_BACKEND_ENABLED: 'dry_run',
  SUPABASE_URL: 'https://zjmuydbuskxouqlkcspy.supabase.co',
  SUPABASE_SECRET_KEY: [
    'header',
    Buffer.from(JSON.stringify({ ref: 'zjmuydbuskxouqlkcspy' })).toString('base64url'),
    'signature'
  ].join('.'),
  SUPABASE_SCHEMA: 'public',
  RESEARCH_COHORT: 'lkkc-may-june-2026',
  APP_VERSION: 'lkkc-pilot-v1.0'
});

assert.equal(diagnostic.backend_enabled, 'dry_run');
assert.equal(diagnostic.supabase_url_present, true);
assert.equal(diagnostic.supabase_url_ref, 'zjmuydbuskxouqlkcspy');
assert.equal(diagnostic.supabase_url_matches_expected, true);
assert.equal(diagnostic.supabase_secret_key_present, true);
assert.equal(diagnostic.supabase_secret_key_ref, 'zjmuydbuskxouqlkcspy');
assert.equal(diagnostic.supabase_secret_key_matches_expected, true);
assert.equal(diagnostic.supabase_schema, 'public');
assert.equal(diagnostic.research_cohort, 'lkkc-may-june-2026');
assert.equal(diagnostic.app_version, 'lkkc-pilot-v1.0');
assert.equal(JSON.stringify(diagnostic).includes('signature'), false);
assert.equal(JSON.stringify(diagnostic).includes('header'), false);

const bad = mod.buildResearchEnvDiagnostic({
  RESEARCH_BACKEND_ENABLED: 'dry_run',
  SUPABASE_URL: 'https://different-ref.supabase.co',
  SUPABASE_SECRET_KEY: 'not-a-jwt',
  SUPABASE_SCHEMA: 'public'
});

assert.equal(bad.supabase_url_ref, 'different-ref');
assert.equal(bad.supabase_url_matches_expected, false);
assert.equal(bad.supabase_secret_key_ref, null);
assert.equal(bad.supabase_secret_key_matches_expected, false);

console.log('task 26 env diagnostic checks passed');
