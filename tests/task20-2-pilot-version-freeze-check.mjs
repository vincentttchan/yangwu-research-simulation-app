import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const pilotVersion = 'lkkc-pilot-v1.0';
const cohort = 'lkkc-may-june-2026';
const contentMapVersion = 'content-freeze-lite-v0.1';

const files = {
  version: join(root, 'src', 'research', 'version.js'),
  contentMap: join(root, 'src', 'research', 'content-map.js'),
  envExample: join(root, '.env.example'),
  loginApi: join(root, 'api', 'login.js'),
  logsBatchApi: join(root, 'api', 'logs-batch.js'),
  task20_2: join(root, 'docs', 'task-20-2-pilot-version-freeze-final-rehearsal-prep.md'),
  signoff: join(root, 'docs', 'task-20-1-student-pilot-readiness-signoff.md'),
  idMap: join(root, 'docs', 'research-id-map.md'),
  dataDictionary: join(root, 'docs', 'research-data-dictionary.md'),
  packageJson: join(root, 'package.json')
};

Object.entries(files).forEach(([label, file]) => {
  assert.equal(existsSync(file), true, `${label} should exist at ${file}`);
});

const read = (file) => readFileSync(file, 'utf8');

assert.match(read(files.version), new RegExp(`APP_VERSION\\s*=\\s*'${pilotVersion.replace(/\./g, '\\.')}'`), 'version.js should freeze APP_VERSION');
assert.match(read(files.version), new RegExp(`RESEARCH_COHORT\\s*=\\s*'${cohort}'`), 'version.js should keep the research cohort');
assert.match(read(files.contentMap), new RegExp(`version:\\s*'${contentMapVersion.replace(/\./g, '\\.')}'`), 'content map should keep the freeze-lite version');
assert.match(read(files.contentMap), new RegExp(`appVersionBaseline:\\s*'${pilotVersion.replace(/\./g, '\\.')}'`), 'content map should record pilot app baseline');
assert.match(read(files.envExample), new RegExp(`^APP_VERSION=${pilotVersion.replace(/\./g, '\\.')}$`, 'm'), '.env.example should show pilot version');
assert.match(read(files.loginApi), new RegExp(pilotVersion.replace(/\./g, '\\.')), 'login fallback should use pilot version');
assert.match(read(files.logsBatchApi), new RegExp(pilotVersion.replace(/\./g, '\\.')), 'log batch fallback should use pilot version');
assert.match(read(files.task20_2), /Required Vercel Update/i, 'Task 20.2 guide should include Vercel update instructions');
assert.match(read(files.task20_2), /Final Rehearsal Checklist/i, 'Task 20.2 guide should include final rehearsal checklist');
assert.match(read(files.task20_2), new RegExp(pilotVersion.replace(/\./g, '\\.')), 'Task 20.2 guide should name the pilot version');
assert.match(read(files.signoff), new RegExp(pilotVersion.replace(/\./g, '\\.')), 'Task 20.1 sign-off should reflect pilot version freeze');
assert.match(read(files.idMap), new RegExp(`App baseline:\\s*\`${pilotVersion.replace(/\./g, '\\.')}\``), 'research ID map should reflect pilot baseline');
assert.match(read(files.dataDictionary), new RegExp(`App baseline:\\s*\`${pilotVersion.replace(/\./g, '\\.')}\``), 'data dictionary should reflect pilot baseline');
assert.match(read(files.packageJson), /check:pilot-version-freeze/, 'package.json should expose check:pilot-version-freeze');

console.log('task 20.2 pilot version freeze checks passed');
