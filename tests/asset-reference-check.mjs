import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const files = ['index.html', 'src/style-explore.css', 'src/intro.js'];
const publicAssets = join(root, 'public', 'assets');

assert.equal(existsSync(publicAssets), true, 'public/assets must exist after Vite migration');

const assetRefs = new Set();
for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8');
  const matches = text.matchAll(/\/?assets\/[A-Za-z0-9_./-]+\.(?:webp|png|jpg|jpeg|mp3|svg)/g);
  for (const match of matches) assetRefs.add(match[0].replace(/^\//, ''));
}

const required = [
  'assets/sketches/yuanmingyuan-engraving.webp',
  'assets/sketches/rabbit-head.webp',
  'assets/map/east-asia-historical.webp',
  'assets/audio/map-theme.mp3',
  'assets/events/e_yellow_sea_battle.webp',
  'assets/cinema/ending-dawn.webp'
];

for (const ref of required) {
  assert.equal(assetRefs.has(ref), true, `${ref} should still be referenced by the game`);
  assert.equal(existsSync(join(root, 'public', ref)), true, `${ref} should exist under public/`);
}

console.log('asset reference checks passed');
