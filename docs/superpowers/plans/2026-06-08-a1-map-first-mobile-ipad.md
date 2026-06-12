# A1 Map-First Mobile/iPad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current city bottom action row into a richer mobile/iPad bottom mission sheet while keeping the city map as the dominant interaction surface.

**Architecture:** Keep the existing single-page Vite app and current `city-actions` system. Add a compact mission-summary layer inside the existing city footer, then add small JavaScript helpers to keep objective, evidence, and next-action text synchronized with city state.

**Tech Stack:** Vite, vanilla JavaScript, static HTML, CSS, current city scene system in `src/intro.js`, current stability checks in `tests/stability-checks.mjs`.

---

## File Structure

- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/index.html`
  - Replace the current city footer with a richer `city-mission-sheet` structure.
  - Preserve existing IDs `cityActionsList`, `cityAdvanceNext`, `exploreCount`, and `exploreTotal`.
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/intro.js`
  - Add mission-sheet state helpers.
  - Update the sheet during city refresh, event return, evidence collection, and facility completion.
  - Add expand/collapse binding for the sheet.
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/style-explore.css`
  - Restyle `city-actions` as a bottom mission sheet.
  - Add mobile portrait and iPad/landscape responsive rules.
  - Ensure main tap targets remain comfortable on touch devices.
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/stability-checks.mjs`
  - Add static regression checks for the mission sheet DOM, CSS, and JS hooks.

Do not modify:

- `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/research/*`
- APP_VERSION or research logger code
- Supabase/Vercel/deployment files

---

### Task 1: Add Failing Stability Checks

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/stability-checks.mjs`

- [ ] **Step 1: Add static checks for the richer mission sheet**

Insert this block after the existing mobile map checks:

```js
assert.match(html, /id="cityMissionSheet"/, 'City view should expose the richer bottom mission sheet');
assert.match(html, /id="cityMissionToggle"/, 'Mission sheet should have an expand/collapse control');
assert.match(html, /id="cityMissionObjective"/, 'Mission sheet should expose the current objective');
assert.match(html, /id="cityMissionNext"/, 'Mission sheet should expose the next action cue');
assert.match(html, /id="cityMissionFeedback"/, 'Mission sheet should expose return feedback after events');
assert.match(intro, /function getCityMissionState\(scene\)/, 'City mission state should be computed in one helper');
assert.match(intro, /function updateCityMissionSheet\(scene,\s*message\)/, 'City mission sheet should refresh with optional feedback');
assert.match(intro, /function setMissionSheetExpanded\(expanded\)/, 'Mission sheet should support explicit expand/collapse state');
assert.match(css, /\.city-mission-sheet/, 'Mission sheet CSS should be present');
assert.match(css, /@media \(max-width:\s*700px\)[\s\S]*\.city-mission-sheet/, 'Mobile mission sheet layout should be capped for map visibility');
assert.match(css, /\.city-mission-toggle[\s\S]*min-height:\s*44px/, 'Mission toggle should have a comfortable touch target');
assert.match(css, /\.hotspot[\s\S]*min-width:\s*44px[\s\S]*min-height:\s*44px/, 'City hotspots should expose comfortable touch targets');
```

- [ ] **Step 2: Run stability checks and verify they fail**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
npm run check:stability
```

Expected: FAIL with `City view should expose the richer bottom mission sheet`.

- [ ] **Step 3: Commit the failing test only**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
git add tests/stability-checks.mjs
git commit -m "test: define mobile mission sheet stability checks"
```

Expected: commit includes only `tests/stability-checks.mjs`.

---

### Task 2: Add Mission Sheet DOM Structure

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/index.html`

- [ ] **Step 1: Replace the existing city footer**

Find this block:

```html
          <!-- 底部行動列表 -->
          <footer class="city-actions">
            <div class="city-actions-list" id="cityActionsList">
              <!-- 由 JS 注入 -->
            </div>
            <div class="city-time-controls">
              <button class="ca-advance ca-advance--skip" type="button" id="cityAdvanceNext">
                <span class="cs-text">推 至 要 事</span>
              </button>
            </div>
            <span class="city-explore-count">
              <span class="cec-icon">◐</span>
              <span class="cec-label">證 據</span>
              <em id="exploreCount">0</em>
              <span class="cec-slash">/</span>
              <em id="exploreTotal">5</em>
            </span>
          </footer>
```

Replace it with:

```html
          <!-- 底部任務面板：手機/iPad richer sheet -->
          <footer class="city-actions city-mission-sheet" id="cityMissionSheet" data-expanded="false" aria-label="城市任務面板">
            <button class="city-mission-toggle" id="cityMissionToggle" type="button" aria-expanded="false" aria-controls="cityMissionDetails">
              <span class="cms-grip" aria-hidden="true"></span>
              <span class="cms-kicker">當 前 任 務</span>
              <span class="cms-objective" id="cityMissionObjective">進城尋找線索</span>
              <span class="cms-next" id="cityMissionNext">點選朱砂熱點</span>
            </button>
            <div class="city-mission-progress" aria-label="證據收集進度">
              <span class="cec-icon">◐</span>
              <span class="cec-label">證 據</span>
              <em id="exploreCount">0</em>
              <span class="cec-slash">/</span>
              <em id="exploreTotal">5</em>
            </div>
            <div class="city-mission-feedback" id="cityMissionFeedback" aria-live="polite"></div>
            <div class="city-mission-details" id="cityMissionDetails">
              <div class="city-actions-list" id="cityActionsList">
                <!-- 由 JS 注入 -->
              </div>
              <div class="city-time-controls">
                <button class="ca-advance ca-advance--skip" type="button" id="cityAdvanceNext">
                  <span class="cs-text">推 至 要 事</span>
                </button>
              </div>
            </div>
          </footer>
```

- [ ] **Step 2: Run the app syntax/build checks**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
npm run check:syntax
npm run check:assets
```

Expected:

```text
asset reference checks passed
```

and `check:syntax` exits with code 0.

- [ ] **Step 3: Run stability checks and confirm remaining failures are JS/CSS-related**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
npm run check:stability
```

Expected: FAIL on `City mission state should be computed in one helper` or another mission-sheet JS/CSS assertion.

- [ ] **Step 4: Commit DOM changes**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
git add index.html
git commit -m "feat: add city mission sheet markup"
```

Expected: commit includes only `index.html`.

---

### Task 3: Add Mission Sheet State Helpers

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/intro.js`

- [ ] **Step 1: Insert mission helper functions before `refreshCitySceneContent`**

Find:

```js
  function refreshCitySceneContent(scene) {
```

Insert this code immediately before it:

```js
  function getCityMissionState(scene) {
    const activeScene = scene || CITY_SCENES[gameState.currentCity];
    const visibleHotspots = activeScene ? visibleCityHotspots(activeScene) : [];
    const foundVisible = visibleHotspots.filter((hs) => hasFoundHotspot(gameState.currentCity, hs.id)).length;
    const remaining = visibleHotspots.filter((hs) => !hasFoundHotspot(gameState.currentCity, hs.id));
    const locked = optionalActionsLocked();
    const actionIds = activeScene ? (activeScene.actionEvents || []) : [];
    const availableAction = actionIds.map((eventId) => {
      const ev = EVENTS[eventId];
      if (!ev || ev.type === 'pinned') return null;
      if ((ev.appearFromYear || 0) > gameState.currentYear) return null;
      const isDone = gameState.completedEvents.has(eventId);
      const foundEvidence = eventEvidenceCount(eventId, activeScene);
      const requiredEvidence = eventEvidenceRequired(eventId, activeScene);
      const isUnlocked = (gameState.unlockedEvents || new Set()).has(eventId) || foundEvidence >= requiredEvidence;
      return { eventId, ev, isDone, foundEvidence, requiredEvidence, isUnlocked };
    }).find((item) => item && !item.isDone && item.isUnlocked && !locked);

    let objective = '進城尋找線索';
    let next = '點選朱砂熱點';
    if (!activeScene) {
      objective = '尚未進入城市';
      next = '返回地圖選擇城市';
    } else if (availableAction) {
      objective = taskGoalText(availableAction.ev, availableAction.eventId, activeScene);
      next = '整理已收集證據';
    } else if (remaining.length > 0) {
      objective = '收集城市線索';
      next = '尚有 ' + remaining.length + ' 處可探';
    } else if (locked) {
      objective = '他城要事待辦';
      next = '先處理鐵釘史事';
    } else {
      objective = cityEmptyHint(activeScene);
      next = '可推至下一要事';
    }

    return {
      objective,
      next,
      foundVisible,
      totalVisible: visibleHotspots.length
    };
  }

  function updateCityMissionSheet(scene, message) {
    const state = getCityMissionState(scene);
    setText('cityMissionObjective', state.objective);
    setText('cityMissionNext', state.next);
    setText('exploreCount', String(state.foundVisible));
    setText('exploreTotal', String(state.totalVisible));
    const feedback = document.getElementById('cityMissionFeedback');
    if (feedback) {
      feedback.textContent = message || '';
      feedback.toggleAttribute('hidden', !message);
    }
  }

  function setMissionSheetExpanded(expanded) {
    const sheet = document.getElementById('cityMissionSheet');
    const toggle = document.getElementById('cityMissionToggle');
    const value = expanded ? 'true' : 'false';
    if (sheet) sheet.dataset.expanded = value;
    if (toggle) toggle.setAttribute('aria-expanded', value);
  }

  function toggleMissionSheet() {
    const sheet = document.getElementById('cityMissionSheet');
    const expanded = !(sheet && sheet.dataset.expanded === 'true');
    setMissionSheetExpanded(expanded);
  }
```

- [ ] **Step 2: Update `refreshCitySceneContent` to use the helper**

Find:

```js
    const foundVisible = visibleHotspots.filter((hs) => hasFoundHotspot(gameState.currentCity, hs.id)).length;
    setText('exploreCount', String(foundVisible));
    setText('exploreTotal', String(visibleHotspots.length));
```

Replace with:

```js
    updateCityMissionSheet(activeScene);
```

The function should still call `renderCityClueHint(activeScene, visibleHotspots);`, `renderActionList(activeScene);`, and `renderFacilities(activeScene);` after that.

- [ ] **Step 3: Bind the toggle button**

Find:

```js
  document.getElementById('cityBack')?.addEventListener('click', closeCityScene);
```

Insert immediately after it:

```js
  document.getElementById('cityMissionToggle')?.addEventListener('click', toggleMissionSheet);
```

- [ ] **Step 4: Collapse the sheet when entering and closing cities**

In `openCityScene`, immediately before `refreshCitySceneContent(scene);`, add:

```js
    setMissionSheetExpanded(false);
```

In `closeCityScene`, immediately after `if (hm) hm.setAttribute('hidden', '');`, add:

```js
    setMissionSheetExpanded(false);
```

- [ ] **Step 5: Run syntax and stability checks**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
npm run check:syntax
npm run check:stability
```

Expected: syntax passes; stability may still fail on CSS assertions.

- [ ] **Step 6: Commit JS helper changes**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
git add src/intro.js
git commit -m "feat: compute city mission sheet state"
```

Expected: commit includes only `src/intro.js`.

---

### Task 4: Add Return Feedback After Evidence, Events, and Facilities

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/intro.js`

- [ ] **Step 1: Add evidence feedback after evidence reveal completion**

In `showEvidenceReveal`, replace:

```js
      submit.onclick = () => { closeEvidenceTaskModal(); };
```

with:

```js
      submit.onclick = () => {
        closeEvidenceTaskModal();
        updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name);
      };
```

Also replace this line inside the `ev && !done && !locked` branch:

```js
      submit.onclick = () => { closeEvidenceTaskModal(); openEvent(hs.unlocks); };
```

with:

```js
      submit.onclick = () => {
        closeEvidenceTaskModal();
        updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name + '，可整理相關史事');
        openEvent(hs.unlocks);
      };
```

- [ ] **Step 2: Add event-return feedback**

In `closeEventModal`, immediately after:

```js
    if (axis && eventId) {
      commitEvent(eventId, axis);
    }
```

add:

```js
    if (eventId && citySceneIsOpen()) {
      const ev = EVENTS[eventId];
      const feedback = ev ? ('已整理史事：' + ev.title) : '已整理一項史事';
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], feedback);
    }
```

- [ ] **Step 3: Add facility-return feedback**

In `finishFacilityVisit`, immediately after:

```js
    refreshAxes();
    flashSceneTagline(f.name + ' · 歲 月 一 季 流 轉');
```

add:

```js
    updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已完成：' + f.name);
```

- [ ] **Step 4: Run syntax and stability checks**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
npm run check:syntax
npm run check:stability
```

Expected: syntax passes; stability may still fail on CSS assertions.

- [ ] **Step 5: Commit feedback wiring**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
git add src/intro.js
git commit -m "feat: show city mission return feedback"
```

Expected: commit includes only `src/intro.js`.

---

### Task 5: Restyle the City Footer as a Richer Bottom Sheet

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/style-explore.css`

- [ ] **Step 1: Replace the current city action/footer CSS**

Find the block from:

```css
/* 底部行動列表 */
.city-actions {
```

through the `.cec-slash` rule, then replace that city-action section with:

```css
/* 底部任務面板 */
.city-mission-sheet {
  flex-shrink: 0;
  padding: 12px 24px max(12px, env(safe-area-inset-bottom));
  background: rgba(20, 16, 12, 0.82);
  border-top: 1px solid rgba(229, 224, 217, 0.14);
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -18px 44px rgba(0, 0, 0, 0.32);
}
.city-mission-toggle {
  min-height: 44px;
  background: rgba(229, 224, 217, 0.06);
  border: 1px solid rgba(229, 224, 217, 0.16);
  color: rgba(232, 222, 202, 0.9);
  font-family: var(--font-zh);
  cursor: pointer;
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 8px 10px;
  text-align: left;
  padding: 8px 12px;
}
.city-mission-toggle:hover {
  background: rgba(229, 224, 217, 0.1);
  border-color: rgba(229, 224, 217, 0.32);
}
.cms-grip {
  width: 28px;
  height: 3px;
  border-radius: 999px;
  background: rgba(232, 222, 202, 0.4);
}
.cms-kicker {
  font-size: 10px;
  letter-spacing: 0.24em;
  color: rgba(232, 222, 202, 0.52);
}
.cms-objective {
  min-width: 0;
  font-size: 12px;
  letter-spacing: 0.12em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cms-next {
  grid-column: 3;
  font-size: 10.5px;
  letter-spacing: 0.16em;
  color: rgba(232, 222, 202, 0.6);
}
.city-mission-progress {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(232, 222, 202, 0.7);
  font-family: var(--font-zh);
  font-size: 12px;
  letter-spacing: 0.2em;
  padding: 0 8px;
}
.city-mission-feedback {
  min-height: 32px;
  max-width: 280px;
  display: flex;
  align-items: center;
  color: rgba(232, 222, 202, 0.72);
  font-family: var(--font-zh);
  font-size: 11px;
  letter-spacing: 0.12em;
}
.city-mission-feedback[hidden] {
  display: none;
}
.city-mission-details {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.city-mission-sheet[data-expanded="false"] .city-mission-details {
  display: none;
}
.city-actions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ca-item {
  min-height: 44px;
  background: transparent;
  border: 1px solid rgba(229, 224, 217, 0.2);
  color: rgba(232, 222, 202, 0.85);
  font-family: var(--font-zh);
  font-size: 12px;
  letter-spacing: 0.18em;
  padding: 8px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 3px;
  transition: background 0.3s var(--ease), border-color 0.3s var(--ease);
}
.ca-main {
  line-height: 1.25;
}
.ca-evidence {
  font-size: 10px;
  letter-spacing: 0.18em;
  color: rgba(232, 222, 202, 0.46);
}
.ca-item:hover {
  background: rgba(229, 224, 217, 0.08);
  border-color: rgba(229, 224, 217, 0.4);
}
.ca-tag {
  font-family: var(--font-en);
  font-style: normal;
  font-size: 9.5px;
  letter-spacing: 0.18em;
  color: var(--vermillion);
  background: rgba(166, 58, 42, 0.15);
  border: 1px solid rgba(166, 58, 42, 0.45);
  padding: 1px 6px;
  text-transform: uppercase;
}
.cec-icon {
  color: var(--vermillion);
  font-size: 13px;
}
.cec-label {
  font-size: 11px;
  color: rgba(232, 222, 202, 0.6);
}
.city-mission-progress em {
  font-family: var(--font-en);
  font-style: normal;
  font-size: 14px;
  color: rgba(232, 222, 202, 0.95);
}
.cec-slash {
  color: rgba(232, 222, 202, 0.3);
  margin: 0 1px;
}
```

- [ ] **Step 2: Add comfortable hotspot targets**

Find:

```css
.hotspot {
  position: absolute;
  width: 28px;
  height: 28px;
```

Change it to:

```css
.hotspot {
  position: absolute;
  width: 28px;
  height: 28px;
  min-width: 44px;
  min-height: 44px;
```

Then change:

```css
  margin: -14px 0 0 -14px;
```

to:

```css
  margin: -22px 0 0 -22px;
```

- [ ] **Step 3: Run stability checks and confirm CSS assertions pass**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
npm run check:stability
```

Expected: may still fail on mobile media query if not yet added; no failure for base `.city-mission-sheet`, `.city-mission-toggle`, or `.hotspot`.

- [ ] **Step 4: Commit base bottom-sheet styling**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
git add src/style-explore.css
git commit -m "style: convert city footer into mission sheet"
```

Expected: commit includes only `src/style-explore.css`.

---

### Task 6: Add Mobile and iPad Responsive Rules

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/style-explore.css`

- [ ] **Step 1: Replace the current mobile city action rules**

In the existing `@media (max-width: 768px)` block, replace:

```css
  .city-actions { padding: 10px 14px; gap: 10px; }
  .ca-item { padding: 6px 10px; font-size: 11px; letter-spacing: 0.14em; }
```

with:

```css
  .city-mission-sheet {
    padding: 10px 14px max(10px, env(safe-area-inset-bottom));
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }
  .city-mission-progress {
    justify-content: flex-end;
    padding-right: 0;
  }
  .city-mission-feedback {
    grid-column: 1 / -1;
    max-width: none;
  }
  .city-mission-details {
    align-items: stretch;
    flex-direction: column;
  }
  .ca-item {
    padding: 8px 10px;
    font-size: 11px;
    letter-spacing: 0.14em;
  }
```

- [ ] **Step 2: Replace the current small-phone city action rules**

In the existing `@media (max-width: 480px)` block, replace:

```css
  .city-actions { padding: 10px 12px; gap: 8px; }
  .ca-item { padding: 6px 10px; font-size: 11px; letter-spacing: 0.1em; }
```

with:

```css
  .city-mission-sheet {
    padding: 8px 10px max(8px, env(safe-area-inset-bottom));
    grid-template-columns: 1fr;
    max-height: 42vh;
    overflow-y: auto;
  }
  .city-mission-toggle {
    grid-template-columns: auto 1fr;
  }
  .cms-kicker {
    display: none;
  }
  .cms-objective {
    font-size: 11px;
    letter-spacing: 0.08em;
  }
  .cms-next {
    grid-column: 2;
    font-size: 10px;
    letter-spacing: 0.08em;
  }
  .city-mission-progress {
    min-height: 32px;
    justify-content: flex-start;
    padding: 0;
  }
  .city-mission-details {
    max-height: 26vh;
    overflow-y: auto;
  }
  .ca-item {
    width: 100%;
    padding: 9px 10px;
    font-size: 11px;
    letter-spacing: 0.08em;
  }
```

- [ ] **Step 3: Add dedicated mobile cap required by stability checks**

Find the final `@media (max-width: 700px)` block used for the stability sprint. Inside it, add:

```css
  .city-mission-sheet {
    max-height: 42vh;
    overflow-y: auto;
  }
```

- [ ] **Step 4: Run all static checks**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
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

- [ ] **Step 5: Commit responsive CSS**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
git add src/style-explore.css
git commit -m "style: tune city mission sheet for mobile and ipad"
```

Expected: commit includes only `src/style-explore.css`.

---

### Task 7: Browser Verification

**Files:**
- No file edits unless a verification issue is found.

- [ ] **Step 1: Start the local Vite server**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
npm run dev
```

Expected: Vite reports a local URL such as `http://localhost:5173/`.

- [ ] **Step 2: Verify desktop layout**

Open:

```text
http://localhost:5173/
```

Expected:

- images load from `public/assets`;
- entering a city shows the city map as the main visual;
- the mission sheet is visible at the bottom;
- expanding the sheet reveals action buttons without covering the entire map;
- desktop map layout is not regressed.

- [ ] **Step 3: Verify iPad-sized viewport**

Use browser/device emulation or Playwright with a viewport close to:

```text
1024 x 768
```

Expected:

- city map remains wide and visually dominant;
- mission sheet is lower and compact;
- objective, evidence count, and next-action cue remain readable;
- tap targets do not feel cramped.

- [ ] **Step 4: Verify mobile portrait viewport**

Use browser/device emulation or Playwright with a viewport close to:

```text
390 x 844
```

Expected:

- city map remains visible above the sheet;
- collapsed richer sheet shows objective, evidence count, and next action;
- expanded sheet does not cover the whole map;
- event modal can be completed without hidden controls;
- returning from an event updates the mission feedback.

- [ ] **Step 5: Run final command verification**

Run:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
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

- [ ] **Step 6: Commit verification fixes if needed**

If browser verification required CSS or JS fixes, commit only those touched files:

```bash
cd /Users/vincentttchan99/Desktop/洋務運動遊戲/探索版
git add index.html src/intro.js src/style-explore.css tests/stability-checks.mjs
git commit -m "fix: polish city mission sheet verification issues"
```

Expected: commit includes only files changed for A1 mission sheet work.

---

## Self-Review Checklist

- Spec coverage:
  - Map-first direction: implemented through preserving the city canvas and converting only the bottom footer into a mission sheet.
  - Richer collapsed sheet: implemented through objective, evidence progress, next-action cue, and feedback elements.
  - Mobile/iPad ergonomics: implemented through responsive CSS and 44px touch targets.
  - Event return feedback: implemented through `updateCityMissionSheet(scene, message)`.
  - Research-logger separation: preserved by not modifying `src/research/*`.
- Placeholder scan:
  - The plan contains no undefined task names or missing file paths.
  - Every task includes exact commands and expected outcomes.
- Type/name consistency:
  - DOM IDs used in HTML, JS, and tests match: `cityMissionSheet`, `cityMissionToggle`, `cityMissionObjective`, `cityMissionNext`, `cityMissionFeedback`, `cityMissionDetails`.
  - Existing IDs preserved: `cityActionsList`, `cityAdvanceNext`, `exploreCount`, `exploreTotal`.

---

## Execution Notes

The repository currently has migration-related uncommitted and untracked changes. Before executing this plan, review `git status --short` and decide whether commits should be made during the sprint or whether changes should remain uncommitted until the Vite migration and research-logger work are reconciled.
