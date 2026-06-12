# Sprint C Core Loop Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first playable loop clear: map target, city observation, evidence check, event decision, result, and return to map.

**Architecture:** Keep the existing Vite/vanilla JS structure and continue working inside `src/intro.js`, `src/style-explore.css`, `index.html`, and `tests/stability-checks.mjs`. Add small state helpers for first-city protection and coachmark deferral, then refine hotspot and event presentation through existing modal and CSS hooks.

**Tech Stack:** Vite, vanilla JavaScript, HTML, CSS, Node-based stability checks.

**Commit Policy:** Do not commit in this workspace unless the user explicitly asks. The worktree contains parallel migration/research changes, so this plan omits commit steps.

---

## File Map

- `tests/stability-checks.mjs`: Add Sprint C assertions before implementation, then keep them as regression guards.
- `src/intro.js`: Expand coach steps, add city-entry protection helpers, defer pinned events while coachmark or first-city guidance is active, and separate hotspot observation from evidence/check panels.
- `src/style-explore.css`: Add Sprint C overrides near the end of the file to darken the selection page, refine event choices into an archive/edict style, and keep hotspot observation and modal layers from overlapping.
- `index.html`: Minimal text/class changes only if CSS/JS cannot achieve the required visual clarity.
- `docs/superpowers/specs/2026-06-09-sprint-c-core-loop-clarity-design.md`: Source of truth for scope and acceptance criteria.

---

### Task 1: Add Sprint C Stability Guards

**Files:**
- Modify: `tests/stability-checks.mjs`

- [ ] **Step 1: Add Core Loop Clarity assertions after the B1 block.**

Insert this block after the existing B1 assertions:

```js
assert.match(intro, /const MAP_COACH = \[[\s\S]*朱砂印[\s\S]*青綠印[\s\S]*四 方 風 聲/, 'C should keep map coach focused on target, side visits, and resistance context');
assert.match(intro, /const CITY_COACH = \[[\s\S]*先 看 紅 點[\s\S]*所 見[\s\S]*查 證[\s\S]*史 事 抉 擇/, 'C should teach the city loop in staged in-world prompts');
assert.match(intro, /function shouldProtectFirstCityEntry\(cityKey\)[\s\S]*citiesIntroduced/, 'C should define a first-city entry protection helper');
assert.match(intro, /function markCityIntroSeen\(cityKey\)[\s\S]*citiesIntroduced/, 'C should mark city intro guidance as seen');
assert.match(intro, /function shouldDeferPinnedForCoreLoop\(ev,\s*onCityEnter\)[\s\S]*coachmark:not\(\[hidden\]\)/, 'C should defer pinned events while core-loop guidance is active');
assert.match(intro, /checkAndTriggerPinned\(true\)[\s\S]*shouldDeferPinnedForCoreLoop/, 'C should route city-entry pinned events through the deferral guard');
assert.match(intro, /hideHotspotObservation\(\);[\s\S]*openEvidenceTask\(cityKey,\s*hs,\s*btn\)/, 'C should hide observation text before opening the evidence task');
assert.match(css, /Sprint C · Core Loop Clarity[\s\S]*\.screen--selection[\s\S]*background/, 'C should include selection-page visual unification styles');
assert.match(css, /Sprint C · Core Loop Clarity[\s\S]*\.em-choice[\s\S]*border-left/, 'C should restyle event choices as archive decisions');
assert.match(css, /Sprint C · Core Loop Clarity[\s\S]*\.hotspot-observation[\s\S]*max-width/, 'C should include hotspot observation layering refinements');
```

- [ ] **Step 2: Run the stability check and confirm it fails before implementation.**

Run:

```bash
npm run check:stability
```

Expected result:

```text
AssertionError ... C should define a first-city entry protection helper
```

The exact first failing assertion may differ, but it should fail on one of the new Sprint C guards.

---

### Task 2: Expand Coachmark Into a Six-Step Core Loop

**Files:**
- Modify: `src/intro.js`

- [ ] **Step 1: Replace `MAP_COACH` with three map-only prompts.**

Use this exact array:

```js
const MAP_COACH = [
  { sel: '#topbarHint', title: '朱 砂 所 指', text: '朱砂印代表眼前要務。先看它指向哪一城，再決定動身。' },
  { sel: '#topbarSide', title: '青 綠 可 訪', text: '青綠印不是主線急報，而是可另行探訪的線索。若暫無把握，可先跟朱砂走。' },
  { sel: '#mapStats .ms-group:nth-child(1)', title: '四 方 風 聲', text: '朝廷、清議、民情、餉源都會回應你的抉擇。它們不是分數，而是局勢。' }
];
```

- [ ] **Step 2: Replace `CITY_COACH` with four city-loop prompts.**

Use this exact array:

```js
const CITY_COACH = [
  { sel: '.city-hotspots', title: '先 看 紅 點', text: '紅點是現場留下的痕跡。先看一眼，不必急着判斷。' },
  { sel: '#hotspotObservation', title: '所 見 而 已', text: '浮出的短句只是你眼前所見。真正能否成為證據，要進一步查證。' },
  { sel: '#cityMissionSheet', title: '查 證 入 卷', text: '點入紅點後完成查證，線索才會收入手卷。' },
  { sel: '#cityMissionSheet', title: '史 事 抉 擇', text: '證據入卷後，相關史事才會展開。你的處置會推動局勢變化。' }
];
```

- [ ] **Step 3: Run syntax and stability checks.**

Run:

```bash
npm run check:syntax
npm run check:stability
```

Expected after this task: syntax passes; stability still fails on first-city protection and CSS assertions.

---

### Task 3: Add First-City Entry Protection And Pinned Event Deferral

**Files:**
- Modify: `src/intro.js`

- [ ] **Step 1: Add city-intro state helpers near the coachmark helpers.**

Place these functions after `window.__replayCoach`:

```js
function ensureCityIntroState() {
  gameState.citiesIntroduced = gameState.citiesIntroduced || [];
  return gameState.citiesIntroduced;
}

function shouldProtectFirstCityEntry(cityKey) {
  if (!cityKey) return false;
  const seen = ensureCityIntroState();
  if (seen.indexOf(cityKey) !== -1) return false;
  const scene = CITY_SCENES[cityKey];
  if (!scene || !cityScenePlayable(scene)) return false;
  return visibleCityHotspots(scene).some((hs) => !hasFoundHotspot(cityKey, hs.id));
}

function markCityIntroSeen(cityKey) {
  if (!cityKey) return;
  const seen = ensureCityIntroState();
  if (seen.indexOf(cityKey) === -1) {
    seen.push(cityKey);
    saveGame();
  }
}

function coreLoopLayerOpen() {
  return !!document.querySelector('#coachmark:not([hidden]), #evidenceTaskModal:not([hidden]), #hotspotModal:not([hidden])');
}

function shouldDeferPinnedForCoreLoop(ev, onCityEnter) {
  if (!ev || !onCityEnter) return false;
  if (!citySceneIsOpen()) return false;
  if (shouldProtectFirstCityEntry(ev.city)) return true;
  return coreLoopLayerOpen();
}
```

- [ ] **Step 2: Change `checkAndTriggerPinned` so city-entry pinned events can defer.**

Inside both branches where the code currently schedules `openEvent(resolvePinnedToOpen(...))`, insert the guard before clearing prompt state.

For the `pendingPinnedId` branch, replace:

```js
const pid = gameState.pendingPinnedId;
gameState.locked = false; gameState.pendingPinnedCity = null; gameState.pendingPinnedId = null;
clearForcePrompt(); refreshActionList();
setTimeout(() => openEvent(resolvePinnedToOpen(pid)), fireDelay);
```

with:

```js
const pid = gameState.pendingPinnedId;
if (shouldDeferPinnedForCoreLoop(ev, onCityEnter)) {
  gameState.locked = true;
  gameState.pendingPinnedCity = ev.city;
  showForcePrompt(ev.city);
  refreshActionList();
  return;
}
gameState.locked = false; gameState.pendingPinnedCity = null; gameState.pendingPinnedId = null;
clearForcePrompt(); refreshActionList();
setTimeout(() => openEvent(resolvePinnedToOpen(pid)), fireDelay);
```

For the `findDueTravelPinned()` branch, replace:

```js
gameState.locked = false; gameState.pendingPinnedCity = null; gameState.pendingPinnedId = null;
clearForcePrompt();
setTimeout(() => openEvent(resolvePinnedToOpen(tid)), fireDelay);
```

with:

```js
if (shouldDeferPinnedForCoreLoop(ev, onCityEnter)) {
  gameState.locked = true;
  gameState.pendingPinnedCity = ev.city;
  gameState.pendingPinnedId = tid;
  showForcePrompt(ev.city);
  refreshActionList();
  return;
}
gameState.locked = false; gameState.pendingPinnedCity = null; gameState.pendingPinnedId = null;
clearForcePrompt();
setTimeout(() => openEvent(resolvePinnedToOpen(tid)), fireDelay);
```

- [ ] **Step 3: Mark a city intro as seen after evidence completion.**

In `completeEvidenceTask`, after `markEvidenceTaskDone(cityKey, hs.id);`, add:

```js
markCityIntroSeen(cityKey);
```

- [ ] **Step 4: Re-check pinned events after evidence completion.**

At the end of `finishEvidenceReveal`, after each branch that closes the evidence modal and updates the mission sheet, add this scheduling line:

```js
setTimeout(() => checkAndTriggerPinned(true), 450);
```

Use a small helper to avoid duplicating it:

```js
function resumePinnedAfterCoreLoop() {
  setTimeout(() => checkAndTriggerPinned(true), 450);
}
```

Then call `resumePinnedAfterCoreLoop();` after the modal has closed in `finishEvidenceReveal`.

- [ ] **Step 5: Run syntax and stability checks.**

Run:

```bash
npm run check:syntax
npm run check:stability
```

Expected after this task: syntax passes; stability should now pass the first-city helper assertions but still fail on CSS visual assertions.

---

### Task 4: Fix Hotspot Observation And Evidence Layering

**Files:**
- Modify: `src/intro.js`
- Modify: `src/style-explore.css`

- [ ] **Step 1: Make `hideHotspotObservation` clear inline position and active state.**

Replace the function with:

```js
function hideHotspotObservation() {
  const obs = document.getElementById('hotspotObservation');
  if (obs) {
    obs.setAttribute('hidden', '');
    obs.classList.remove('is-visible');
    obs.style.removeProperty('--ho-x');
    obs.style.removeProperty('--ho-y');
  }
  document.querySelectorAll('#cityHotspots .hotspot.is-observation-open').forEach((node) => {
    node.classList.remove('is-observation-open');
  });
}
```

- [ ] **Step 2: Make `showHotspotObservation` prefer above/right positioning and avoid bottom sheet overlap.**

Inside `showHotspotObservation`, replace the coordinate clamping block:

```js
obs.style.setProperty('--ho-x', Math.max(8, Math.min(92, x)).toFixed(2) + '%');
obs.style.setProperty('--ho-y', Math.max(12, Math.min(82, y)).toFixed(2) + '%');
```

with:

```js
const safeX = Math.max(14, Math.min(86, x + (x < 54 ? 10 : -10)));
const safeY = Math.max(18, Math.min(68, y));
obs.style.setProperty('--ho-x', safeX.toFixed(2) + '%');
obs.style.setProperty('--ho-y', safeY.toFixed(2) + '%');
obs.dataset.side = x < 54 ? 'right' : 'left';
```

- [ ] **Step 3: Ensure evidence task always replaces observation.**

In `openHotspot`, keep `hideHotspotObservation();` as the first statement. In the branch:

```js
if (!wasFound && task && !isEvidenceTaskDone(cityKey, hs.id)) {
  hm.setAttribute('hidden', '');
  if (openEvidenceTask(cityKey, hs, btn)) return;
}
```

replace it with:

```js
if (!wasFound && task && !isEvidenceTaskDone(cityKey, hs.id)) {
  hideManagedModal('hotspotModal');
  hm.setAttribute('hidden', '');
  if (openEvidenceTask(cityKey, hs, btn)) return;
}
```

- [ ] **Step 4: Add Sprint C hotspot CSS near the end of `src/style-explore.css`.**

Append this block after the B1 block:

```css
/* ============================================================
   Sprint C · Core Loop Clarity
   ============================================================ */
.hotspot-observation {
  max-width: min(340px, calc(100% - 56px));
  width: max-content;
  grid-template-columns: 1fr;
  padding: 10px 14px;
  background: rgba(18, 14, 10, 0.58);
  border-color: rgba(238, 216, 172, 0.34);
  box-shadow: 0 12px 32px rgba(10, 7, 4, 0.36), inset 0 0 0 1px rgba(255, 246, 220, 0.06);
}
.hotspot-observation[data-side="right"] {
  transform: translate(10px, calc(-100% - 14px));
}
.hotspot-observation[data-side="left"] {
  transform: translate(calc(-100% - 10px), calc(-100% - 14px));
}
.hotspot-observation.is-visible[data-side="right"] {
  transform: translate(12px, calc(-100% - 18px));
}
.hotspot-observation.is-visible[data-side="left"] {
  transform: translate(calc(-100% - 12px), calc(-100% - 18px));
}
.hotspot-observation p {
  max-width: 30ch;
  color: rgba(248, 240, 220, 0.92);
}
.city-hotspots .hotspot.is-observation-open::before {
  box-shadow: 0 0 0 4px rgba(170, 54, 40, 0.22), 0 0 18px rgba(170, 54, 40, 0.42);
}
```

- [ ] **Step 5: Run syntax and stability checks.**

Run:

```bash
npm run check:syntax
npm run check:stability
```

Expected after this task: syntax passes; stability should pass hotspot layering and still fail only on selection/event visual assertions if those styles are not yet added.

---

### Task 5: Unify First-Round Visual Language

**Files:**
- Modify: `src/style-explore.css`

- [ ] **Step 1: Add selection-page dark engraving overrides inside the Sprint C CSS block.**

Extend the Sprint C block with:

```css
.screen--selection {
  background:
    radial-gradient(ellipse 58% 60% at 28% 48%, rgba(30, 18, 10, 0.16), transparent 72%),
    linear-gradient(90deg, rgba(12, 8, 5, 0.72), rgba(23, 16, 10, 0.34) 38%, rgba(18, 12, 7, 0.62)),
    #18110b;
}
.screen--selection .s2c-slide {
  background: rgba(30, 24, 18, 0.86) !important;
  border: 1px solid rgba(218, 180, 112, 0.28);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.46), inset 0 0 0 1px rgba(255, 238, 190, 0.05);
}
.screen--selection .s2c-overlay,
.screen--selection .s2c-slide[data-route-key="lihongzhang"] .s2c-overlay,
.screen--selection .s2c-slide[data-route-key="yixin"] .s2c-overlay,
.screen--selection .s2c-slide[data-route-key="rongheng"] .s2c-overlay,
.screen--selection .s2c-slide[data-route-key="free"] .s2c-overlay {
  background: linear-gradient(90deg, rgba(18, 12, 8, 0.98) 0%, rgba(25, 17, 11, 0.9) 38%, rgba(25, 17, 11, 0.34) 68%, transparent 94%) !important;
}
.screen--selection .s2c-name,
.screen--selection .s2c-route-line {
  color: rgba(242, 226, 184, 0.92) !important;
}
.screen--selection .s2c-bio {
  color: rgba(226, 214, 190, 0.74) !important;
}
.screen--selection .s2c-portrait {
  mix-blend-mode: screen;
  filter: sepia(0.42) contrast(1.08) brightness(0.78);
}
.screen--selection .s2c-cta {
  border-color: rgba(190, 64, 42, 0.82) !important;
  color: rgba(236, 196, 146, 0.88) !important;
  background: rgba(80, 24, 16, 0.14) !important;
}
.screen--selection .s2c-cta:hover:not(.is-chosen) {
  background: rgba(132, 42, 28, 0.26) !important;
}
```

- [ ] **Step 2: Add event-choice archive styling inside the same Sprint C block.**

Use:

```css
.event-modal .em-card {
  background:
    linear-gradient(180deg, rgba(248, 241, 222, 0.96), rgba(226, 217, 194, 0.96)),
    var(--stone-sand);
}
.em-choices {
  gap: 12px;
}
.em-choice {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  border-left: 3px solid rgba(166, 58, 42, 0.72);
  background: rgba(255, 252, 242, 0.42);
  box-shadow: inset 0 0 0 1px rgba(48, 65, 67, 0.08);
}
.em-choice::before {
  content: '奏';
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(166, 58, 42, 0.12);
  color: rgba(166, 58, 42, 0.86);
  font-family: var(--font-zh);
  font-size: 13px;
}
.em-choice .emc-arrow {
  display: none;
}
.em-choice:hover {
  transform: translateX(2px);
  background: rgba(166, 58, 42, 0.08);
}
.em-choice-label {
  color: rgba(166, 58, 42, 0.82);
}
```

- [ ] **Step 3: Run stability check.**

Run:

```bash
npm run check:stability
```

Expected after this task: stability passes all Sprint C CSS assertions.

---

### Task 6: Full Verification And Manual QA Notes

**Files:**
- Modify only if verification finds a precise issue:
  - `src/intro.js`
  - `src/style-explore.css`
  - `tests/stability-checks.mjs`

- [ ] **Step 1: Run all project checks.**

Run:

```bash
npm run check:syntax
npm run check:stability
npm run check:assets
npm run build
```

Expected:

```text
stability checks passed
asset reference checks passed
✓ built
```

- [ ] **Step 2: If browser tools are available, manually inspect the core path.**

Use the current local app URL and check:

```text
登陸頁 → 入局啟程 → 李鴻章 → 啟程入局 → 過場 → 地圖 → 目標城 → 城市紅點 → 查證 → 證據入卷 → 史事抉擇
```

Expected observations:

```text
1. 地圖 coachmark has at least three in-world prompts and no numbered tutorial labels.
2. City coachmark appears before pinned event modal on first city entry.
3. Hotspot observation disappears before evidence task opens.
4. Event choices look like archive decisions, not plain answer boxes.
5. No DSE or worksheet language appears in the player-facing first loop.
```

- [ ] **Step 3: If browser tools are not available, report the limitation clearly.**

Use this final note:

```text
I completed static verification and production build. Automated in-browser click QA was not available in this environment, so the first-loop visual path still needs a manual pass in the open browser.
```

---

## Self-Review Notes

- Spec coverage: Tasks 2 and 3 cover staged teaching and first-city protection. Task 4 covers hotspot layering. Task 5 covers first-round visual unity and event page game feel. Task 6 covers validation.
- Scope control: The plan avoids backend, research logger, new assets, and full mobile/iPad redesign.
- Test-first path: Task 1 introduces failing Sprint C assertions before implementation.
- Known risk: First-city protection depends on `gameState.citiesIntroduced`; if existing save migration assumes no such property, the helper initializes it lazily and does not require a migration.
