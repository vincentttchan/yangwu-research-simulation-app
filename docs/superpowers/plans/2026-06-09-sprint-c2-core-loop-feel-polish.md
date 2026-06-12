# Sprint C2 Core Loop Feel Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first playable loop feel continuous: red-dot observation stays near the clue, evidence completion naturally opens the first Beijing event, and character selection reads as one cinematic scene.

**Architecture:** Keep the existing Vite/vanilla JS structure. Add small helper functions in `src/intro.js` for near-hotspot positioning and post-evidence pinned-event timing, then use final CSS overrides in `src/style-explore.css` to unify the character selection page without restructuring the carousel.

**Tech Stack:** Vite, vanilla JavaScript, CSS, Node-based stability checks.

**Commit Policy:** Do not commit in this workspace unless the user explicitly asks. The worktree contains parallel migration/research changes, so this plan omits commit steps.

---

## File Map

- `tests/stability-checks.mjs`: Add Sprint C2 regression assertions before implementation.
- `src/intro.js`: Add close-range hotspot observation helpers, make evidence completion run the pinned-event resume path after the collected toast, and ensure observation is hidden before evidence opens.
- `src/style-explore.css`: Add Sprint C2 overrides for near-hotspot observation and a more integrated cinematic character selection page.
- `docs/superpowers/specs/2026-06-09-sprint-c2-core-loop-feel-polish-design.md`: Source of truth for scope and acceptance criteria.

---

### Task 1: Add Sprint C2 Stability Guards

**Files:**
- Modify: `tests/stability-checks.mjs`

- [ ] **Step 1: Add C2 assertions after the existing Sprint C assertions.**

Insert this block immediately after:

```js
assert.match(css, /Sprint C · Core Loop Clarity[\s\S]*\.hotspot-observation[\s\S]*max-width/, 'C should include hotspot observation layering refinements');
```

Use this exact code:

```js
assert.match(intro, /function getHotspotObservationAnchor\([\s\S]*gapX[\s\S]*gapY/, 'C2 should compute close-range hotspot observation anchors');
assert.match(intro, /showHotspotObservation\(hs,\s*btn\)[\s\S]*openHotspot\(hs,\s*btn\)/, 'C2 should keep tap-to-observe before tap-to-open behavior');
assert.match(intro, /function finishEvidenceReveal\(hs\)[\s\S]*resumePinnedAfterCoreLoop\(\)[\s\S]*openEvent\(hs\.unlocks\)/, 'C2 should resume deferred pinned events from evidence completion before optional hotspot events');
assert.match(intro, /function resumePinnedAfterCoreLoop\(\)[\s\S]*checkAndTriggerPinned\(true\)/, 'C2 should keep a single post-evidence pinned resume helper');
assert.match(css, /Sprint C2 · Core Loop Feel Polish[\s\S]*\.hotspot-observation[\s\S]*--ho-gap-x/, 'C2 should position observation copy near the red-dot clue');
assert.match(css, /Sprint C2 · Core Loop Feel Polish[\s\S]*\.screen--selection \.s2c-slide[\s\S]*min-height:\s*100%/, 'C2 should make character selection feel like one full cinematic stage');
assert.match(css, /Sprint C2 · Core Loop Feel Polish[\s\S]*\.screen--selection \.s2c-portrait-wrap[\s\S]*mask-image/, 'C2 should visually blend portraits into the shared scene');
assert.match(css, /Sprint C2 · Core Loop Feel Polish[\s\S]*\.screen--selection \.s2c-tags[\s\S]*opacity:\s*0\.[0-7]/, 'C2 should demote route stats and tags below the character mood');
```

- [ ] **Step 2: Run stability check and confirm it fails on C2.**

Run:

```bash
npm run check:stability
```

Expected result:

```text
AssertionError ... C2 should compute close-range hotspot observation anchors
```

The exact first C2 assertion may differ, but the check must fail because C2 has not yet been implemented.

---

### Task 2: Keep Hotspot Observation Close To The Red Dot

**Files:**
- Modify: `src/intro.js`
- Modify: `src/style-explore.css`
- Test: `tests/stability-checks.mjs`

- [ ] **Step 1: Add a positioning helper before `showHotspotObservation`.**

In `src/intro.js`, place this helper after `shortObservationCopy` and before `showHotspotObservation`:

```js
  function getHotspotObservationAnchor(canvasRect, spotRect) {
    const x = ((spotRect.left + spotRect.width / 2 - canvasRect.left) / Math.max(canvasRect.width, 1)) * 100;
    const y = ((spotRect.top + spotRect.height / 2 - canvasRect.top) / Math.max(canvasRect.height, 1)) * 100;
    const nearLeft = x < 52;
    const nearTop = y < 42;
    return {
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(12, Math.min(84, y)),
      side: nearLeft ? 'right' : 'left',
      vertical: nearTop ? 'below' : 'above',
      gapX: nearLeft ? '14px' : '-14px',
      gapY: nearTop ? '14px' : '-14px'
    };
  }
```

- [ ] **Step 2: Replace the safeX/safeY block inside `showHotspotObservation`.**

Replace this code:

```js
    const x = ((spotRect.left + spotRect.width / 2 - canvasRect.left) / Math.max(canvasRect.width, 1)) * 100;
    const y = ((spotRect.top + spotRect.height / 2 - canvasRect.top) / Math.max(canvasRect.height, 1)) * 100;
    const safeX = Math.max(14, Math.min(86, x + (x < 54 ? 10 : -10)));
    const safeY = Math.max(18, Math.min(68, y));
    obs.style.setProperty('--ho-x', safeX.toFixed(2) + '%');
    obs.style.setProperty('--ho-y', safeY.toFixed(2) + '%');
    obs.dataset.side = x < 54 ? 'right' : 'left';
```

with this code:

```js
    const anchor = getHotspotObservationAnchor(canvasRect, spotRect);
    obs.style.setProperty('--ho-x', anchor.x.toFixed(2) + '%');
    obs.style.setProperty('--ho-y', anchor.y.toFixed(2) + '%');
    obs.style.setProperty('--ho-gap-x', anchor.gapX);
    obs.style.setProperty('--ho-gap-y', anchor.gapY);
    obs.dataset.side = anchor.side;
    obs.dataset.vertical = anchor.vertical;
```

- [ ] **Step 3: Clear the new CSS variables in `hideHotspotObservation`.**

After:

```js
      obs.style.removeProperty('--ho-y');
```

add:

```js
      obs.style.removeProperty('--ho-gap-x');
      obs.style.removeProperty('--ho-gap-y');
```

- [ ] **Step 4: Add Sprint C2 observation CSS at the end of `src/style-explore.css`.**

Append this block after the Sprint C block:

```css
/* ============================================================
   Sprint C2 · Core Loop Feel Polish
   ============================================================ */
.hotspot-observation {
  max-width: min(300px, calc(100% - 44px));
  --ho-gap-x: 14px;
  --ho-gap-y: -14px;
}
.hotspot-observation[data-side="right"] {
  transform: translate(var(--ho-gap-x), var(--ho-gap-y));
}
.hotspot-observation[data-side="left"] {
  transform: translate(calc(-100% + var(--ho-gap-x)), var(--ho-gap-y));
}
.hotspot-observation[data-vertical="above"] {
  transform: translate(var(--ho-gap-x), calc(-100% + var(--ho-gap-y)));
}
.hotspot-observation[data-side="left"][data-vertical="above"] {
  transform: translate(calc(-100% + var(--ho-gap-x)), calc(-100% + var(--ho-gap-y)));
}
.hotspot-observation.is-visible[data-side="right"],
.hotspot-observation.is-visible[data-side="left"],
.hotspot-observation.is-visible[data-vertical="above"],
.hotspot-observation.is-visible[data-side="left"][data-vertical="above"] {
  opacity: 1;
}
```

- [ ] **Step 5: Run the focused checks.**

Run:

```bash
npm run check:syntax
npm run check:stability
```

Expected result: syntax passes; stability still fails on C2 evidence-order or selection-page assertions until later tasks are complete.

---

### Task 3: Let Evidence Completion Trigger The First Deferred History Event

**Files:**
- Modify: `src/intro.js`
- Test: `tests/stability-checks.mjs`

- [ ] **Step 1: Add a helper to detect a pending event for the current city.**

Place this function before `finishEvidenceReveal`:

```js
  function hasPendingPinnedInCurrentCity() {
    const pendingId = gameState.pendingPinnedId || findDueTravelPinned();
    const ev = pendingId ? EVENTS[pendingId] : null;
    return !!(ev && ev.city && gameState.currentCity === ev.city && !gameState.completedEvents.has(pendingId));
  }
```

- [ ] **Step 2: Rewrite `finishEvidenceReveal` to prioritize the deferred pinned route.**

Replace the current `finishEvidenceReveal` function with:

```js
  function finishEvidenceReveal(hs) {
    const ev = hs.unlocks ? EVENTS[hs.unlocks] : null;
    const done = ev && gameState.completedEvents.has(hs.unlocks);
    const locked = optionalActionsLocked();
    if (hasPendingPinnedInCurrentCity()) {
      closeEvidenceTaskModal();
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name + '，史事即將展開');
      resumePinnedAfterCoreLoop();
      return;
    }
    if (ev && !done && !locked) {
      closeEvidenceTaskModal();
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name + '，可整理相關史事');
      openEvent(hs.unlocks);
    } else if (ev && !done && locked) {
      const setText = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
      const submit = document.getElementById('etSubmit');
      if (submit) {
        submit.textContent = '要 事 待 辦 · 暫 不 探 訪';
        submit.disabled = true;
        submit.onclick = null;
      }
      setText('etFeedback', '已收錄證據。處理他城要事後可回此探訪。');
      addRevealDoneButton();
    } else {
      closeEvidenceTaskModal();
      updateCityMissionSheet(CITY_SCENES[gameState.currentCity], '已收錄證據：' + hs.name);
      resumePinnedAfterCoreLoop();
    }
  }
```

- [ ] **Step 3: Run checks.**

Run:

```bash
npm run check:syntax
npm run check:stability
```

Expected result: syntax passes; stability still fails only on remaining selection-page CSS assertions.

---

### Task 4: Make Character Selection One Cinematic Stage

**Files:**
- Modify: `src/style-explore.css`
- Test: `tests/stability-checks.mjs`

- [ ] **Step 1: Append C2 character-selection CSS after the hotspot C2 block.**

Add this code after the Sprint C2 hotspot rules:

```css
.screen--selection .selection-stage,
.screen--selection .s2c-carousel,
.screen--selection .s2c-slide {
  min-height: 100%;
}
.screen--selection .s2c-slide {
  border: 0;
  border-radius: 0;
  background:
    linear-gradient(90deg, rgba(12, 8, 5, 0.96) 0%, rgba(18, 12, 7, 0.86) 34%, rgba(30, 24, 18, 0.34) 58%, rgba(246, 232, 190, 0.10) 100%) !important;
  box-shadow: inset 0 0 140px rgba(0, 0, 0, 0.64);
}
.screen--selection .s2c-slide::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(6, 4, 3, 0.24), transparent 34%, rgba(246, 224, 170, 0.10)),
    radial-gradient(ellipse 44% 70% at 72% 48%, rgba(238, 216, 168, 0.16), transparent 68%);
  mix-blend-mode: screen;
}
.screen--selection .s2c-overlay {
  background:
    linear-gradient(90deg, rgba(10, 7, 5, 0.98) 0%, rgba(13, 9, 6, 0.9) 30%, rgba(16, 11, 8, 0.42) 55%, transparent 82%) !important;
}
.screen--selection .s2c-text {
  max-width: min(520px, 42vw);
  padding-left: clamp(52px, 7vw, 110px);
  z-index: 3;
}
.screen--selection .s2c-name {
  text-shadow: 0 0 32px rgba(210, 160, 90, 0.26);
}
.screen--selection .s2c-portrait-wrap {
  width: min(48vw, 760px);
  right: 0;
  mask-image: linear-gradient(90deg, transparent 0%, #000 16%, #000 82%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 16%, #000 82%, transparent 100%);
}
.screen--selection .s2c-portrait-card,
.screen--selection .s2c-portrait-face {
  background: transparent !important;
  box-shadow: none !important;
}
.screen--selection .s2c-portrait {
  opacity: 0.86;
  mix-blend-mode: luminosity;
  filter: sepia(0.34) contrast(1.08) brightness(0.9);
}
.screen--selection .s2c-tags {
  opacity: 0.56;
}
.screen--selection .s2c-cta {
  min-width: 260px;
  background: rgba(92, 30, 20, 0.26) !important;
  box-shadow: inset 0 0 0 1px rgba(246, 213, 150, 0.12), 0 18px 48px rgba(0, 0, 0, 0.24);
}
```

- [ ] **Step 2: Add a responsive safety rule for narrower screens.**

Append this code after the previous block:

```css
@media (max-width: 900px) {
  .screen--selection .s2c-text {
    max-width: min(620px, 76vw);
    padding-left: 40px;
  }
  .screen--selection .s2c-portrait-wrap {
    width: 58vw;
    opacity: 0.48;
  }
}
```

- [ ] **Step 3: Run checks.**

Run:

```bash
npm run check:syntax
npm run check:stability
```

Expected result: syntax and stability pass.

---

### Task 5: Full Verification

**Files:**
- No code edits unless verification exposes a failure.

- [ ] **Step 1: Run all project checks.**

Run:

```bash
npm run check:syntax
npm run check:stability
npm run check:assets
npm run build
```

Expected result: all commands pass.

- [ ] **Step 2: Manual browser walkthrough.**

Use the already-running local app if available. Verify this desktop path:

1. Landing page opens.
2. Enter character selection.
3. Li Hongzhang page reads as one cinematic scene rather than a split data panel.
4. Select Li Hongzhang.
5. Enter map and go to Beijing.
6. Hover/tap the first red dot; observation stays near the red dot.
7. Click the red dot; observation hides before evidence opens.
8. Finish evidence; the first Beijing history event opens automatically.

- [ ] **Step 3: Report remaining visual risk honestly.**

If browser control is unavailable, report that static/build checks passed and the open-browser click QA still needs a manual pass.

---

## Self-Review

- Spec coverage: Task 2 covers close red-dot observation; Task 3 covers evidence-to-event continuity; Task 4 covers cinematic character selection; Task 5 covers verification.
- Placeholder scan: no unresolved marker or fill-in-later steps.
- Scope check: this plan avoids research logger, Supabase, new content, and full responsive refactor.
- Type consistency: helper names used by tests match planned implementation names: `getHotspotObservationAnchor`, `hasPendingPinnedInCurrentCity`, `resumePinnedAfterCoreLoop`.
