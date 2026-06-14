# Task 21 Mobile Map Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile and iPad map feel map-first by reducing persistent HUD density, improving city visibility, and keeping journal/event/stat controls reachable.

**Architecture:** Reuse the existing map DOM and event-collapse mechanism. Implement most changes in responsive CSS, with a small JavaScript layer for mobile default collapsed state and a stats drawer toggle. Do not touch research logging, content IDs, Supabase code, or city coordinates.

**Tech Stack:** Vite, vanilla JavaScript in `src/intro.js`, CSS in `src/style-explore.css`, static HTML in `index.html`, local browser QA through localhost.

---

## File Structure

- Modify `src/style-explore.css`
  - Owns responsive layout, mobile drawer positioning, touch target sizing, map framing, panel density, and visual hierarchy.
- Modify `src/intro.js`
  - Owns mobile-only event panel default collapse and mobile stats drawer open/close state.
- Modify `index.html`
  - Adds a compact stats trigger button inside the map UI layer.
- Do not modify research files, Supabase files, content-map files, or city coordinate data.

---

## Task 1: Add Mobile Stats Trigger Markup

**Files:**
- Modify: `index.html:241-242`
- Test: manual DOM/browser check in Task 5

- [ ] **Step 1: Add a compact stats trigger before `#mapStats`**

Insert this button immediately before `<aside class="map-stats" id="mapStats" ...>`:

```html
      <button class="map-stats-tab" id="mapStatsTab" type="button" aria-label="展開四方阻力與見識" aria-expanded="false">
        <span class="mst-main">四 方</span>
        <span class="mst-sub" id="mapStatsTabSummary">55 · 50 · 50 · 45</span>
      </button>
```

- [ ] **Step 2: Confirm markup remains inside `#screen3` map UI layer**

Run:

```bash
rg -n "mapStatsTab|map-stats\" id=\"mapStats" index.html
```

Expected:

```text
index.html:<line>:      <button class="map-stats-tab" id="mapStatsTab" ...
index.html:<line>:      <aside class="map-stats" id="mapStats" ...
```

- [ ] **Step 3: Commit this task if executing in a clean feature branch**

```bash
git add index.html
git commit -m "feat: add mobile map stats trigger"
```

If the worktree contains unrelated dirty files, skip commit and report that the commit was intentionally deferred.

---

## Task 2: Add Mobile Drawer State Logic

**Files:**
- Modify: `src/intro.js:6425-6441`
- Test: browser interaction in Task 5

- [ ] **Step 1: Extend event collapse binding to default collapsed on mobile**

Replace the existing `bindEventsCollapse` function block at `src/intro.js:6425-6441` with:

```js
  // —— 史事欄收摺成書籤頁籤（呼吸式面板；手機預設收起）——
  (function bindEventsCollapse() {
    const aside = document.getElementById('mapEvents');
    const btnCollapse = document.getElementById('eventsCollapse');
    const btnTab = document.getElementById('eventsTab');
    if (!aside || !btnCollapse || !btnTab) return;
    const KEY = 'yangwu_events_collapsed';
    const mobileQuery = window.matchMedia ? window.matchMedia('(max-width: 700px)') : null;

    function apply(collapsed) {
      aside.classList.toggle('is-collapsed', collapsed);
      btnCollapse.setAttribute('aria-expanded', String(!collapsed));
      btnTab.setAttribute('aria-expanded', String(!collapsed));
      try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch (e) {}
    }

    function initialCollapsed() {
      try {
        const stored = localStorage.getItem(KEY);
        if (stored === '1') return true;
        if (stored === '0') return false;
      } catch (e) {}
      return !!(mobileQuery && mobileQuery.matches);
    }

    apply(initialCollapsed());
    btnCollapse.addEventListener('click', () => apply(true));
    btnTab.addEventListener('click', () => apply(false));
  })();
```

- [ ] **Step 2: Add mobile stats drawer binding after event collapse binding**

Immediately after the `bindEventsCollapse` IIFE, add:

```js
  // —— 手機四方阻力／見識抽屜 —— 
  (function bindMobileStatsDrawer() {
    const panel = document.getElementById('mapStats');
    const tab = document.getElementById('mapStatsTab');
    if (!panel || !tab) return;

    function setOpen(open) {
      panel.classList.toggle('is-mobile-open', open);
      tab.setAttribute('aria-expanded', String(open));
    }

    tab.addEventListener('click', () => {
      setOpen(!panel.classList.contains('is-mobile-open'));
    });

    panel.addEventListener('click', (event) => {
      if (event.target === panel && window.matchMedia && window.matchMedia('(max-width: 700px)').matches) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  })();
```

- [ ] **Step 3: Update stats tab summary inside existing resource rendering**

Find the function that updates `mresn-favor`, `mresn-opinion`, `mresn-populace`, and `mresn-funds`. Add this after those numeric values are updated:

```js
    const statsTabSummary = document.getElementById('mapStatsTabSummary');
    if (statsTabSummary) {
      statsTabSummary.textContent = [
        gameState.resources.favor,
        gameState.resources.opinion,
        gameState.resources.populace,
        gameState.resources.funds
      ].join(' · ');
    }
```

If the resource update function uses a local state alias such as `s`, use that alias consistently:

```js
    const statsTabSummary = document.getElementById('mapStatsTabSummary');
    if (statsTabSummary) {
      statsTabSummary.textContent = [
        s.resources.favor,
        s.resources.opinion,
        s.resources.populace,
        s.resources.funds
      ].join(' · ');
    }
```

- [ ] **Step 4: Run syntax check**

Run:

```bash
npm run check:syntax
```

Expected: exit 0.

- [ ] **Step 5: Commit this task if executing in a clean feature branch**

```bash
git add src/intro.js
git commit -m "feat: add mobile map drawer state"
```

If the worktree contains unrelated dirty files, skip commit and report that the commit was intentionally deferred.

---

## Task 3: Implement Mobile Map Priority CSS

**Files:**
- Modify: `src/style-explore.css`
- Test: browser visual QA in Task 5

- [ ] **Step 1: Add base styles for the stats trigger**

Add near the `.map-stats` block around `src/style-explore.css:1694`:

```css
.map-stats-tab {
  display: none;
  position: absolute;
  z-index: 7;
  border: 1px solid rgba(229, 224, 217, 0.16);
  background: rgba(20, 16, 12, 0.58);
  color: rgba(232, 222, 202, 0.9);
  backdrop-filter: blur(7px);
  font-family: var(--font-zh);
  cursor: pointer;
}
.mst-main {
  display: block;
  letter-spacing: 0.24em;
}
.mst-sub {
  display: block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: rgba(228, 218, 198, 0.6);
}
```

- [ ] **Step 2: Replace the current crowded mobile map rule**

In the `@media (max-width: 700px)` block around `src/style-explore.css:7473-7492`, replace the combined `.map-events, .map-stats` rule and its `.map-events` / `.map-stats` positioning with this mobile-first version:

```css
  .map-events {
    position: fixed;
    left: 10px;
    bottom: max(12px, env(safe-area-inset-bottom));
    top: auto;
    z-index: 8;
    width: min(70vw, 250px);
    max-height: 44vh;
    padding: 11px 10px;
    overflow-y: auto;
    backdrop-filter: blur(7px);
    background: rgba(20, 16, 12, 0.62);
    transform: none;
  }
  .map-events.is-collapsed {
    width: auto;
    max-height: none;
    padding: 0;
    overflow: visible;
    background: transparent;
    border-color: transparent;
    backdrop-filter: none;
    transform: none;
  }
  .map-events.is-collapsed .events-head,
  .map-events.is-collapsed .events-list,
  .map-events.is-collapsed .events-collapse {
    display: none;
  }
  .events-tab {
    min-width: 52px;
    min-height: 46px;
    position: static;
    margin: 0;
    padding: 8px 9px;
    opacity: 0;
    pointer-events: none;
    flex-direction: row;
    gap: 6px;
    background: rgba(20, 16, 12, 0.62);
    border: 1px solid rgba(229, 224, 217, 0.16);
  }
  .map-events.is-collapsed .events-tab {
    opacity: 1;
    pointer-events: auto;
  }
  .events-tab .et-label {
    writing-mode: horizontal-tb;
    text-orientation: mixed;
    font-size: 12px;
    letter-spacing: 0.18em;
  }
  .events-tab .et-arrow {
    transform: rotate(-90deg);
  }
  .events-journal {
    width: 44px;
    height: 44px;
  }
```

- [ ] **Step 3: Add mobile stats collapsed/open styles**

In the same `@media (max-width: 700px)` block, add after the mobile `.map-events` rules:

```css
  .map-stats-tab {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
    right: 10px;
    bottom: max(12px, env(safe-area-inset-bottom));
    min-width: 132px;
    min-height: 46px;
    padding: 7px 10px;
  }
  .mst-main {
    font-size: 12px;
  }
  .mst-sub {
    font-size: 10px;
    letter-spacing: 0.02em;
  }
  .map-stats {
    position: fixed;
    right: 10px;
    bottom: calc(max(12px, env(safe-area-inset-bottom)) + 56px);
    top: auto;
    z-index: 8;
    width: min(78vw, 286px);
    max-height: 48vh;
    padding: 12px 12px;
    gap: 10px;
    overflow-y: auto;
    background: rgba(20, 16, 12, 0.68);
    backdrop-filter: blur(8px);
    opacity: 0;
    pointer-events: none;
    transform: translateY(8px);
    transition: opacity 0.22s var(--ease), transform 0.22s var(--ease);
  }
  .screen--map[data-phase="6"] .map-stats {
    opacity: 0;
    pointer-events: none;
  }
  .screen--map[data-phase="6"] .map-stats.is-mobile-open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
  .map-stats .ms-group--network {
    display: none;
  }
```

- [ ] **Step 4: Tighten mobile topbar and protect map center**

Still inside `@media (max-width: 700px)`, adjust the existing `.map-topbar` rules to:

```css
  .map-topbar {
    top: max(10px, env(safe-area-inset-top));
    left: 10px;
    right: 10px;
    width: auto;
    max-width: none;
    padding: 6px 9px 7px;
    white-space: normal;
    background: rgba(20, 16, 12, 0.44);
  }
  .topbar-year {
    font-size: 10px;
    line-height: 1.25;
    letter-spacing: 0.08em;
  }
  .topbar-hint {
    font-size: 8.5px;
    line-height: 1.35;
    letter-spacing: 0.12em;
  }
```

- [ ] **Step 5: Improve mobile map framing without changing coordinates**

Add inside `@media (max-width: 700px)`:

```css
  .screen--map[data-phase="6"] .map-pan {
    animation: none;
  }
  .screen--map[data-phase="6"] .map-bg-img,
  .screen--map[data-phase="6"] .map-overlay {
    object-position: 52% 50%;
  }
  .city-seal-box {
    filter: drop-shadow(0 1px 2px rgba(18, 12, 8, 0.58));
  }
  .city-seal-text {
    font-size: 18px;
  }
  .city-seal-wait {
    font-size: 7px;
  }
```

- [ ] **Step 6: Add iPad density rules**

Add or refine in `@media (min-width: 701px) and (max-width: 1024px)`:

```css
@media (min-width: 701px) and (max-width: 1024px) {
  .map-events {
    width: 156px;
    max-height: calc(100vh - 180px);
    padding: 12px 11px;
    background: rgba(20, 16, 12, 0.36);
  }
  .map-stats {
    width: 166px;
    padding: 13px 14px;
    gap: 12px;
    background: rgba(20, 16, 12, 0.36);
  }
  .map-stats .ms-group--network .mn-body {
    max-height: 108px;
  }
  .map-topbar {
    max-width: min(520px, calc(100vw - 420px));
  }
}
```

- [ ] **Step 7: Run CSS grep sanity check**

Run:

```bash
rg -n "map-stats-tab|is-mobile-open|@media \\(max-width: 700px\\)|@media \\(min-width: 701px\\)" src/style-explore.css
```

Expected: all four patterns are present.

- [ ] **Step 8: Commit this task if executing in a clean feature branch**

```bash
git add src/style-explore.css
git commit -m "style: prioritize mobile map readability"
```

If the worktree contains unrelated dirty files, skip commit and report that the commit was intentionally deferred.

---

## Task 4: Verify Static Checks and Build

**Files:**
- No source edits unless a check fails.

- [ ] **Step 1: Run syntax check**

```bash
npm run check:syntax
```

Expected: exit 0.

- [ ] **Step 2: Run asset check**

```bash
npm run check:assets
```

Expected: exit 0 with asset reference checks passed.

- [ ] **Step 3: Run stability check**

```bash
npm run check:stability
```

Expected: exit 0 with stability checks passed.

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: exit 0. The existing Vite warning about `src/research/logger.js` being both dynamically and statically imported is acceptable if unchanged.

---

## Task 5: Browser Visual QA

**Files:**
- No source edits unless QA finds a regression.

- [ ] **Step 1: Open local app**

Use the existing local server if `http://localhost:5173/` is already running. If not, start the Vite dev server:

```bash
npm run dev -- --host 0.0.0.0
```

Expected: app available at `http://localhost:5173/` or the next Vite-provided port.

- [ ] **Step 2: Reach playable map**

Browser path:

1. Open `http://localhost:5173/`.
2. Click `入局啟程`.
3. Select the Li Hongzhang route.
4. Click the route CTA again when it changes to `啟程入局`.
5. Click through the opening cutscene until the map phase is active.

Expected: `#screen3` is visible and `.seal-btn[data-panel="juan"]` is clickable.

- [ ] **Step 3: Mobile default map QA at 390x844**

Set viewport to `390x844`.

Expected:

- no horizontal overflow;
- event timeline appears as compact `史事` tab by default;
- stats appear as compact `四方` trigger by default;
- journal button remains visible and clickable;
- at least three city seals/labels are visible or discoverable without opening panels;
- map center is more open than the pre-Task-21 screenshot.

Capture screenshot to `/tmp/yangwu-task21-mobile-default.png`.

- [ ] **Step 4: Mobile event drawer QA**

Click the compact `史事` tab.

Expected:

- event drawer opens;
- event list is readable;
- the drawer does not cover the entire map;
- close/collapse button returns to compact state.

Capture screenshot to `/tmp/yangwu-task21-mobile-events-open.png`.

- [ ] **Step 5: Mobile stats drawer QA**

Click the compact `四方` stats trigger.

Expected:

- stats drawer opens above the trigger;
- four resources and three historical thinking axes are readable;
- network list is hidden on mobile by default;
- pressing Escape or clicking the trigger again closes it.

Capture screenshot to `/tmp/yangwu-task21-mobile-stats-open.png`.

- [ ] **Step 6: Mobile journal QA**

Click the `卷` journal button.

Expected:

- `手卷 · 書記日誌` opens within viewport;
- footer actions are visible;
- no horizontal overflow;
- closing returns to clean map-first state.

Capture screenshot to `/tmp/yangwu-task21-mobile-journal.png`.

- [ ] **Step 7: iPad default map QA at 1024x768**

Set viewport to `1024x768`.

Expected:

- left event panel and right stats panel are present but lighter and narrower;
- central map remains readable;
- no horizontal overflow;
- city labels remain visible.

Capture screenshot to `/tmp/yangwu-task21-ipad-default.png`.

- [ ] **Step 8: iPad journal QA**

Open the journal on iPad viewport.

Expected:

- journal card fits within viewport;
- footer actions remain visible;
- no horizontal overflow.

Capture screenshot to `/tmp/yangwu-task21-ipad-journal.png`.

- [ ] **Step 9: Console health**

Read console logs for warnings/errors.

Expected: no relevant app warnings or errors.

---

## Task 6: Final Review and Handoff

**Files:**
- Review: `index.html`
- Review: `src/intro.js`
- Review: `src/style-explore.css`

- [ ] **Step 1: Review diff scope**

Run:

```bash
git diff -- index.html src/intro.js src/style-explore.css
```

Expected:

- only mobile map readability changes;
- no research logger, Supabase, content ID, or route content changes.

- [ ] **Step 2: Check worktree status**

Run:

```bash
git status -sb
```

Expected:

- changed files from this task are identifiable;
- unrelated existing dirty files are not staged or reverted.

- [ ] **Step 3: Summarize evidence**

Final report should include:

- files changed;
- static checks run;
- browser viewport checks completed;
- screenshot paths;
- any remaining risks, especially whether city visibility is improved enough or whether a later map framing pass is needed.

- [ ] **Step 4: Commit if clean and requested**

Only commit if the user explicitly asks or the branch is clean enough to separate this scope.

```bash
git add index.html src/intro.js src/style-explore.css docs/superpowers/specs/2026-06-14-task-21-mobile-map-readability-design.md docs/superpowers/plans/2026-06-14-task-21-mobile-map-readability.md
git commit -m "feat: improve mobile map readability"
```

If unrelated dirty files remain, do not commit unless the user gives an explicit staging scope.

---

## Self-Review

Spec coverage:

- Mobile map-first disclosure: Tasks 2 and 3.
- Collapsed event timeline: Tasks 2, 3, 5.
- Collapsed stat panel: Tasks 1, 2, 3, 5.
- Journal remains accessible: Tasks 3 and 5.
- iPad lighter panels: Task 3 and 5.
- No research/backend changes: File structure and Task 6.
- Static and browser QA: Tasks 4 and 5.

Placeholder scan:

- No incomplete markers or undefined future-work notes remain in the task steps.

Type and selector consistency:

- `#mapStatsTab`, `#mapStatsTabSummary`, `.map-stats-tab`, `.is-mobile-open`, `#mapEvents`, `#eventsCollapse`, and `#eventsTab` are used consistently across markup, JS, and CSS.
