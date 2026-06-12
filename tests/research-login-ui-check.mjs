import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const files = {
  loginGate: join(root, 'src', 'research', 'login-gate.js'),
  main: join(root, 'src', 'main.js'),
  css: join(root, 'src', 'style-explore.css')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const loginGate = readFileSync(files.loginGate, 'utf8');
const main = readFileSync(files.main, 'utf8');
const css = readFileSync(files.css, 'utf8');

assert.match(loginGate, /MODE_RESEARCH\s*=\s*'research'/, 'Login gate should define research mode explicitly');
assert.match(loginGate, /MODE_DEV\s*=\s*'dev'/, 'Login gate should define dev mode explicitly');
assert.match(loginGate, /URLSearchParams\(window\.location\.search\)/, 'Login gate should read URL mode from query string');
assert.match(loginGate, /mode.*MODE_RESEARCH/s, 'Login gate should only activate for research mode');
assert.match(loginGate, /mode.*MODE_DEV/s, 'Login gate should support explicit dev bypass');

assert.match(loginGate, /participant_code/g, 'Login gate should submit participant_code');
assert.match(loginGate, /session_code/g, 'Login gate should submit session_code');
assert.match(loginGate, /參與代碼/, 'Login gate should show participant code label');
assert.match(loginGate, /課節代碼/, 'Login gate should show session code label');
assert.match(loginGate, /研究登記/, 'Login gate should show research registration heading');
assert.match(loginGate, /此處毋須填寫真實姓名。/, 'Login gate should warn students not to enter real names');
assert.match(loginGate, /核驗 · 入局/, 'Login gate should show in-world research entry button copy');
assert.match(loginGate, /開發試玩/, 'Login gate should include localhost-only development bypass copy');

[
  'email',
  'phone',
  'password',
  'social',
  'student_id',
  'camera',
  'microphone',
  'screen recording',
  '真實姓名.*input',
  '姓名.*input'
].forEach((forbidden) => {
  assert.doesNotMatch(loginGate, new RegExp(forbidden, 'i'), `Login gate should not include forbidden field or collection pattern: ${forbidden}`);
});

assert.match(loginGate, /import\(['"]\.\/api\.js['"]\)/, 'Login gate should dynamically import API helper only when needed');
assert.doesNotMatch(loginGate, /import\s+\{[^}]*loginWithParticipantCode[^}]*\}\s+from\s+['"]\.\/api\.js['"]/, 'Login gate should not statically import API helper');
assert.match(loginGate, /saveResearchSession/, 'Login gate should save successful limited session through session helper');
assert.match(loginGate, /loadResearchSession/, 'Login gate should detect an existing session');
assert.match(loginGate, /supabase_not_connected/, 'Login gate should handle backend-not-connected stub state');
assert.match(loginGate, /result\.status\s*===\s*404/, 'Login gate should treat missing local API route as a backend-not-connected dev state');
assert.match(loginGate, /invalid_or_excluded_participant/, 'Login gate should handle invalid/excluded participant state');
assert.match(loginGate, /暫時未能連接登入服務/, 'Login gate should handle network errors with student-facing copy');

assert.match(main, /import '\.\/research\/login-gate\.js';/, 'main.js should load research login gate module');
assert.doesNotMatch(main, /research\/api\.js/, 'main.js should not import or reference research API helper directly');

assert.match(css, /Research Login Gate/, 'CSS should include a named research login gate section');
assert.match(css, /\.research-login-gate/, 'CSS should style the research login gate');
assert.match(css, /\.research-login-panel/, 'CSS should style the research login panel');
assert.match(css, /@media \(max-width:\s*700px\)[\s\S]*\.research-login-panel/, 'CSS should include mobile layout protection for the login panel');
assert.match(css, /min-height:\s*44px/, 'Login controls should keep comfortable touch targets');

console.log('research login UI checks passed');
