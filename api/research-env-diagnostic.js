const EXPECTED_SUPABASE_REF = 'zjmuydbuskxouqlkcspy';

function cleanText(value) {
  const text = String(value || '').trim();
  return text || null;
}

function supabaseRefFromUrl(value) {
  const url = cleanText(value);
  if (!url) return null;
  const match = url.match(/^https?:\/\/([^.]+)\.supabase\.co\/?$/i);
  return match ? match[1] : null;
}

function refFromJwt(value) {
  const token = cleanText(value);
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return cleanText(payload.ref || payload.project_ref || null);
  } catch {
    return null;
  }
}

export function buildResearchEnvDiagnostic(env = process.env) {
  const supabaseUrlRef = supabaseRefFromUrl(env.SUPABASE_URL);
  const secretKeyRef = refFromJwt(env.SUPABASE_SECRET_KEY);

  return {
    diagnostic: 'research_env_alignment',
    expected_supabase_ref: EXPECTED_SUPABASE_REF,
    backend_enabled: cleanText(env.RESEARCH_BACKEND_ENABLED),
    supabase_url_present: Boolean(cleanText(env.SUPABASE_URL)),
    supabase_url_ref: supabaseUrlRef,
    supabase_url_matches_expected: supabaseUrlRef === EXPECTED_SUPABASE_REF,
    supabase_secret_key_present: Boolean(cleanText(env.SUPABASE_SECRET_KEY)),
    supabase_secret_key_ref: secretKeyRef,
    supabase_secret_key_matches_expected: secretKeyRef === EXPECTED_SUPABASE_REF,
    supabase_schema: cleanText(env.SUPABASE_SCHEMA),
    research_cohort: cleanText(env.RESEARCH_COHORT),
    app_version: cleanText(env.APP_VERSION)
  };
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  response
    .status(200)
    .setHeader('Cache-Control', 'no-store')
    .json(buildResearchEnvDiagnostic());
}
