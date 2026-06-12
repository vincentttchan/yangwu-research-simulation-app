import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const repoParent = join(root, '..');
const gitignorePath = [join(root, '.gitignore'), join(repoParent, '.gitignore')]
  .find((file) => existsSync(file));

const requiredFiles = {
  envExample: join(root, '.env.example'),
  setupChecklist: join(root, 'docs', 'supabase-setup-checklist.md'),
  dryRunSeed: join(root, 'docs', 'supabase-seed-dryrun.sql'),
  schema: join(root, 'docs', 'supabase-schema-v1.sql'),
  gitignore: gitignorePath,
  serverSupabase: join(root, 'api', '_supabase.js'),
  loginApi: join(root, 'api', 'login.js'),
  logsBatchApi: join(root, 'api', 'logs-batch.js')
};

Object.entries(requiredFiles).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const envExample = readFileSync(requiredFiles.envExample, 'utf8');
const setupChecklist = readFileSync(requiredFiles.setupChecklist, 'utf8');
const dryRunSeed = readFileSync(requiredFiles.dryRunSeed, 'utf8');
const schema = readFileSync(requiredFiles.schema, 'utf8');
const gitignore = readFileSync(requiredFiles.gitignore, 'utf8');
const serverSupabase = readFileSync(requiredFiles.serverSupabase, 'utf8');
const loginApi = readFileSync(requiredFiles.loginApi, 'utf8');
const logsBatchApi = readFileSync(requiredFiles.logsBatchApi, 'utf8');

[
  'SUPABASE_URL=',
  'SUPABASE_SECRET_KEY=',
  'SUPABASE_SCHEMA=public',
  'RESEARCH_BACKEND_ENABLED=false',
  'RESEARCH_COHORT=lkkc-may-june-2026',
  'APP_VERSION=dev-v0.1'
].forEach((line) => {
  assert.match(envExample, new RegExp(`^${line}$`, 'm'), `.env.example should contain ${line}`);
});

assert.doesNotMatch(envExample, /https:\/\/[a-z0-9-]+\.supabase\.co/i, '.env.example should not contain a real Supabase URL');
assert.doesNotMatch(envExample, /sb_secret_/i, '.env.example should not contain a Supabase secret key');
assert.doesNotMatch(envExample, /eyJ[A-Za-z0-9_-]+\./, '.env.example should not contain JWT-like keys');
assert.doesNotMatch(envExample, /VITE_SUPABASE/i, '.env.example should not expose Supabase through Vite variables');

['.env', '.env.local', '.env.*.local', '.vercel'].forEach((needle) => {
  assert.match(gitignore, new RegExp(`(^|\\n)${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\n|$)`), `.gitignore should ignore ${needle}`);
});

assert.match(setupChecklist, /server-only/i, 'Checklist should state server-only secret handling');
assert.match(setupChecklist, /Vercel environment variables/i, 'Checklist should cover Vercel environment variables');
assert.match(setupChecklist, /Row Level Security|RLS/, 'Checklist should cover RLS');
assert.match(setupChecklist, /grants/i, 'Checklist should cover grants');
assert.match(setupChecklist, /dry-run/i, 'Checklist should cover dry-run setup');
assert.match(setupChecklist, /withdrawal/i, 'Checklist should mention withdrawal/deletion workflow before formal use');
assert.match(setupChecklist, /not ready for formal research data collection/i, 'Checklist should state the environment is not ready for formal data collection yet');

assert.match(dryRunSeed, /YW-001/, 'Dry-run seed should include YW-001');
assert.match(dryRunSeed, /YW-002/, 'Dry-run seed should include YW-002');
assert.match(dryRunSeed, /YW-999/, 'Dry-run seed should include excluded test participant');
assert.match(dryRunSeed, /LKKC-2026-DRYRUN/, 'Dry-run seed should use dry-run session code');
assert.doesNotMatch(dryRunSeed, /@|email|phone|姓名|真名|student_id|name_to_code/i, 'Dry-run seed should not include personal identifiers');

[
  'alter table participants enable row level security',
  'alter table game_sessions enable row level security',
  'alter table event_logs enable row level security'
].forEach((needle) => {
  assert.match(schema, new RegExp(needle, 'i'), `Schema should include RLS statement: ${needle}`);
});

assert.match(serverSupabase, /createServerSupabaseClient/, 'Server Supabase helper should exist');
assert.match(serverSupabase, /@supabase\/supabase-js/, 'Supabase SDK should be imported only by the server helper');
assert.match(serverSupabase, /SUPABASE_URL/, 'Server Supabase helper should use SUPABASE_URL');
assert.match(serverSupabase, /SUPABASE_SECRET_KEY/, 'Server Supabase helper should use SUPABASE_SECRET_KEY');
assert.match(serverSupabase, /persistSession:\s*false/, 'Server Supabase helper should disable session persistence');
assert.match(loginApi, /supabase_not_connected/, 'Login API should keep a disconnected fallback when dry-run is not enabled');
assert.match(loginApi, /RESEARCH_BACKEND_ENABLED[^]*dry_run/, 'Login API should only connect when RESEARCH_BACKEND_ENABLED is dry_run');
assert.match(logsBatchApi, /supabase_not_connected/, 'Log batch API should keep a disconnected fallback when dry-run is not enabled');
assert.match(logsBatchApi, /RESEARCH_BACKEND_ENABLED[^]*dry_run/, 'Log batch API should only connect when RESEARCH_BACKEND_ENABLED is dry_run');
assert.match(logsBatchApi, /from\(['"]event_logs['"]\)/, 'Log batch API should write accepted dry-run events to event_logs');
assert.match(logsBatchApi, /SAFE_PAYLOAD_KEYS/, 'Log batch API should sanitize payload fields before insert');

function listFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') return [];
    if (entry.isDirectory()) return listFiles(fullPath);
    return [fullPath];
  });
}

const sourceFiles = listFiles(join(root, 'src')).concat([
  requiredFiles.loginApi,
  requiredFiles.logsBatchApi
]);

const frontendFiles = listFiles(join(root, 'src'));

sourceFiles.forEach((file) => {
  const text = readFileSync(file, 'utf8');
  const rel = relative(root, file);
  assert.doesNotMatch(text, /VITE_SUPABASE/i, `${rel} should not use VITE_SUPABASE variables`);
});

frontendFiles.forEach((file) => {
  const text = readFileSync(file, 'utf8');
  const rel = relative(root, file);
  assert.doesNotMatch(text, /SUPABASE_SECRET_KEY|@supabase\/supabase-js|createClient/, `${rel} should not use Supabase server credentials or SDK`);
});

listFiles(root).forEach((file) => {
  if (statSync(file).size > 1_000_000) return;
  const rel = relative(root, file);
  if (rel.startsWith('node_modules') || rel.startsWith('dist')) return;
  const text = readFileSync(file, 'utf8');
  assert.doesNotMatch(text, /sb_secret_[A-Za-z0-9_-]+/, `${rel} should not contain a Supabase secret key`);
  assert.doesNotMatch(text, /service_role[a-z0-9_.-]*\s*=\s*['"][^'"]+['"]/i, `${rel} should not contain a service role value`);
});

console.log('supabase environment checks passed');
