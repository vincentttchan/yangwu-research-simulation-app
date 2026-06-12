import { createClient } from '@supabase/supabase-js';

const DRY_RUN_MODE = 'dry_run';

export function isResearchBackendDryRun(env = process.env) {
  return env.RESEARCH_BACKEND_ENABLED === DRY_RUN_MODE;
}

export function hasSupabaseServerConfig(env = process.env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SECRET_KEY);
}

export function createServerSupabaseClient(env = process.env, clientFactory = createClient) {
  if (!isResearchBackendDryRun(env) || !hasSupabaseServerConfig(env)) return null;

  return clientFactory(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: env.SUPABASE_SCHEMA || 'public'
    }
  });
}
