# Remove Edict Flash Direct Map Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the post-cutscene edict flash so a new route enters the map directly after the existing character cutscene.

**Architecture:** Keep the existing route entry sequence (`runEntry`) intact. Remove the `showObjectiveCard` branch, delete the unused objective-card markup and CSS, and update stability checks to assert direct map entry rather than a compact edict overlay.

**Tech Stack:** Vite, vanilla JavaScript, HTML, CSS, Node-based stability checks.

---

### Task 1: Route Entry Logic

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/intro.js`

- [ ] Replace the new-game objective-card branch with direct `runEntry()`:

```js
    // 新局／續局：人物過場結束後直接揭示入場，避免重複任務說明。
    runEntry();
```

- [ ] Delete the unused `showObjectiveCard(onBegin)` function.

### Task 2: Remove Objective Markup

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/index.html`

- [ ] Delete the entire `objectiveCard` block:

```html
  <div class="objective-card" id="objectiveCard" hidden>
    ...
  </div>
```

### Task 3: Remove Objective CSS

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/style-explore.css`

- [ ] Delete the objective-card and edict-flash CSS selectors and keyframes:
  - `.objective-card`
  - `.objective-card .oc-*`
  - `.oc-sign`
  - `.objective-card.objective-card--flash`
  - `@keyframes ocFlashIn`
  - `@keyframes ocFlashOut`
  - `@keyframes ocSealPulse`

### Task 4: Update Stability Checks

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/stability-checks.mjs`

- [ ] Replace edict-flash assertions with direct-entry assertions:

```js
assert.doesNotMatch(html, /id="objectiveCard"|oc-card--flash|奉 旨|軍 機 處 鈐/, 'Post-cutscene entry should not include an extra edict/objective overlay');
assert.doesNotMatch(intro, /showObjectiveCard|timer\s*=\s*setTimeout\(finish,\s*1150\)/, 'New-game entry should not route through an edict flash helper');
assert.match(intro, /人物過場結束後直接揭示入場[\s\S]*runEntry\(\);/, 'New-game and continued-game routes should enter the existing map reveal directly');
```

### Task 5: Verification

- [ ] Run `npm run check:syntax`
- [ ] Run `npm run check:stability`
- [ ] Run `npm run check:assets`
- [ ] Run `npm run build`
