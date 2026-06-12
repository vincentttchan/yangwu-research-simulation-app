# A3.5 Frontstage Scaffold Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove visible scaffold/worksheet UI from the evidence and event flow so the player experiences a lighter scene-first rhythm.

**Architecture:** Keep existing data and event logic where possible, but stop rendering scaffold labels and DSE tags in the player-facing UI. Evidence task completion should briefly confirm collection and then auto-close or auto-open the linked event. Hotspots should retain 44px hit areas while becoming visually smaller and disappearing when completed.

**Tech Stack:** Vite, vanilla JavaScript in `src/intro.js`, HTML in `index.html`, CSS in `src/style-explore.css`, Node checks in `tests/stability-checks.mjs`.

**Commit Policy:** Do not commit in this workspace unless the user explicitly asks. This plan omits commit steps because the current worktree contains parallel unrelated changes.

---

## File Map

- `tests/stability-checks.mjs`: Replace A3.4 assertions that required scaffold/rhythm/archive UI with A3.5 assertions that forbid those elements and require lighter hotspot behavior.
- `index.html`: Remove visible event rhythm rail, inquiry scaffold markup, and decision trace block from the event modal.
- `src/intro.js`: Stop calling/rendering removed scaffold nodes, shorten hotspot observation copy, hide completed hotspots, replace archive reveal with brief auto-confirmation, and strip DSE tags from visible text.
- `src/style-explore.css`: Remove or neutralize styles for deleted scaffold/archive blocks, shrink hotspot visuals, keep 44px hit targets, and redesign observation tooltip as a translucent scene overlay.
- `docs/superpowers/specs/2026-06-08-a35-frontstage-scaffold-removal-design.md`: Source of truth for this sprint.

---

### Task 1: Rewrite Stability Checks For Scheme A

**Files:**
- Modify: `tests/stability-checks.mjs`

- [ ] Replace scaffold-required assertions with scaffold-forbidden assertions.

Use these replacements around the existing A3/A3.4 assertion block:

```js
assert.doesNotMatch(html, /id="emInquiryScaffold"/, 'Event modal should not expose a visible inquiry scaffold');
assert.doesNotMatch(html, /案 由|線 索|局 勢/, 'Event modal should not show scaffold labels');
assert.doesNotMatch(html, /id="emDecisionTrace"/, 'Event payoff should not expose a decision-trace panel');
assert.doesNotMatch(html, /抉 擇 回 聲/, 'Event payoff should not show explicit decision-trace wording');
assert.doesNotMatch(html, /id="emRhythm"/, 'Event modal should not expose a rhythm rail');
assert.doesNotMatch(html, />境<|>擇<|>問<|>聲</, 'Event modal should not show rhythm step glyphs');
assert.doesNotMatch(html, /入境|追問|回聲/, 'Event modal should not show rhythm step labels');
```

- [ ] Replace archive-card assertions with short-confirmation assertions.

Use:

```js
assert.doesNotMatch(intro, /證 據 入 卷/, 'Evidence completion should not open a full archive page');
assert.doesNotMatch(intro, /ev-archive-card/, 'Evidence completion should not render an archive card');
assert.doesNotMatch(intro, /submit\.textContent\s*=\s*'入 局 →'/, 'Evidence completion should not require an entry button');
assert.match(intro, /function showEvidenceCollectedToast\(hs\)/, 'Evidence completion should show a brief confirmation');
assert.match(intro, /window\.setTimeout\(\(\) => finishEvidenceReveal\(hs\)/, 'Linked evidence should proceed automatically after confirmation');
```

- [ ] Add frontstage DSE removal assertions.

Use:

```js
assert.match(intro, /function stripDseTag\(text\)/, 'Visible text should pass through DSE tag stripping');
assert.doesNotMatch(intro, /DSE：[^'"]+['"]\s*\+/, 'Visible UI should not concatenate DSE labels into player-facing copy');
```

- [ ] Add hotspot visual behavior assertions.

Use:

```js
assert.match(intro, /if \(hasFoundHotspot\(cityKey,\s*hs\.id\)\) return;/, 'Completed hotspots should disappear from the scene');
assert.match(css, /\.hotspot::before[\s\S]*width:\s*22px[\s\S]*height:\s*22px/, 'Hotspot visible dot should be smaller than its hit area');
assert.match(css, /\.hotspot-observation[\s\S]*background:\s*rgba/, 'Observation tooltip should use translucent scene styling');
```

- [ ] Run `npm run check:stability`.

Expected: FAIL before implementation because `index.html`, `src/intro.js`, and CSS still contain the old scaffold/archive UI.

---

### Task 2: Remove Visible Event Scaffold Markup

**Files:**
- Modify: `index.html`
- Modify: `src/intro.js`
- Modify: `src/style-explore.css`

- [ ] Remove the event rhythm rail from `index.html`.

Delete this block:

```html
<ol class="em-rhythm" id="emRhythm" aria-label="事件流程">
  <li data-rhythm-step="choose" aria-current="step"><span>境</span><em>入境</em></li>
  <li data-rhythm-step="payoff"><span>擇</span><em>抉擇</em></li>
  <li data-rhythm-step="challenge"><span>問</span><em>追問</em></li>
  <li data-rhythm-step="result"><span>聲</span><em>回聲</em></li>
</ol>
```

- [ ] Remove the inquiry scaffold block from `index.html`.

Delete the whole `div` with `id="emInquiryScaffold"` and its three `em-inquiry-cell` children.

- [ ] Remove the decision-trace block from `index.html`.

Delete:

```html
<div class="em-decision-trace" id="emDecisionTrace" aria-label="抉擇回聲">
  <span class="em-decision-label">抉 擇 回 聲</span>
  <p id="emDecisionAxis">抉 擇 回 聲</p>
  <p id="emDecisionImpact">留意它如何牽動眼前局勢。</p>
</div>
<p class="em-reflection-prompt" id="emReflectionPrompt">手卷會記下這次抉擇留下的餘波。</p>
```

- [ ] In `src/intro.js`, make `setEventRhythmPhase` a no-op or remove calls safely.

Preferred minimal implementation:

```js
function setEventRhythmPhase(phase) {
  const modal = document.getElementById('eventModal');
  if (modal) modal.dataset.rhythm = phase || 'choose';
}
```

- [ ] In `actuallyOpenEvent`, remove frontstage scaffold text writes.

Delete:

```js
const inquiry = getEventInquiryScaffold(eventId, ev);
setText('emInquiryQuestion', inquiry.question);
setText('emInquiryEvidence', inquiry.evidence);
setText('emInquiryLens', inquiry.lens);
modal.dataset.evidenceLinked = inquiry.evidenceCount > 0 ? 'true' : 'false';
```

Replace with:

```js
const inquiry = getEventInquiryScaffold(eventId, ev);
modal.dataset.evidenceLinked = inquiry.evidenceCount > 0 ? 'true' : 'false';
```

- [ ] In `chooseEvent`, remove writes to deleted decision-trace/reflection nodes.

Delete:

```js
setText('emDecisionAxis', '抉 擇 回 聲');
setText('emDecisionImpact', getChoiceImpactText(choice));
setText('emReflectionPrompt', getChoiceReflectionPrompt(choice, ev));
```

- [ ] Remove or leave unused helper functions only if tests permit.

Keep `getEventInquiryScaffold`, `getChoiceImpactText`, and `getChoiceReflectionPrompt` if later logic still uses them indirectly. The target is no visible scaffold UI, not a broad data refactor.

- [ ] Remove CSS blocks for deleted UI.

Delete selectors beginning with:

```css
.em-rhythm
.em-inquiry-scaffold
.em-inquiry-cell
.em-inquiry-label
.event-modal[data-evidence-linked="true"] .em-inquiry-scaffold
.event-modal[data-evidence-linked="true"] .em-inquiry-cell
.event-modal[data-evidence-linked="true"] .em-inquiry-label
.em-decision-trace
.em-decision-label
.em-reflection-prompt
```

- [ ] Run `npm run check:syntax && npm run check:stability`.

Expected: PASS for scaffold-removal assertions after Tasks 1-2 are implemented.

---

### Task 3: Replace Evidence Archive With Auto Confirmation

**Files:**
- Modify: `src/intro.js`
- Modify: `src/style-explore.css`

- [ ] Add a brief confirmation helper near `renderEvidenceRevealStep`.

Implement:

```js
function showEvidenceCollectedToast(hs) {
  const feedback = document.getElementById('etFeedback');
  const name = hs?.name || '線索';
  if (feedback) {
    feedback.textContent = '已記下：' + name;
    feedback.classList.add('et-feedback--toast');
  }
}
```

- [ ] Replace `renderEvidenceRevealStep` body with a short automatic transition.

Use:

```js
function renderEvidenceRevealStep(hs, task, step) {
  const modal = document.getElementById('evidenceTaskModal');
  const body = document.getElementById('etBody');
  const submit = document.getElementById('etSubmit');
  if (!modal || !body || !submit) return;

  modal.dataset.revealStep = 'toast';
  body.innerHTML = '';
  submit.disabled = true;
  submit.textContent = '已 記 下';
  submit.onclick = null;
  showEvidenceCollectedToast(hs);

  window.setTimeout(() => finishEvidenceReveal(hs), hs?.unlocks ? 650 : 520);
}
```

- [ ] Update `finishEvidenceReveal` only if it assumes a manual archive card.

Preserve current behaviors:

- linked event opens if unlocked and available,
- locked events remain deferred,
- non-linked evidence closes the modal and returns to city.

- [ ] Add toast CSS.

Use:

```css
.et-feedback--toast {
  display: inline-flex;
  align-items: center;
  width: auto;
  max-width: min(420px, 100%);
  margin-top: 14px;
  padding: 8px 12px;
  background: rgba(246, 240, 226, 0.72);
  border-left: 2px solid rgba(166, 58, 42, 0.45);
  color: rgba(48, 65, 67, 0.72);
  font-size: 12px;
  letter-spacing: 0.08em;
}
```

- [ ] Remove archive CSS.

Delete selectors:

```css
.ev-archive-card
.ev-archive-source
.ev-reveal-head
.ev-reveal-kicker
.ev-card-text
.ev-card-foot
```

- [ ] Run `npm run check:syntax && npm run check:stability`.

Expected: PASS and no `證 據 入 卷`, `ev-archive-card`, or `入 局 →` player-facing archive flow.

---

### Task 4: Shrink Hotspots, Hide Completed Hotspots, Redesign Observation Tooltip

**Files:**
- Modify: `src/intro.js`
- Modify: `src/style-explore.css`

- [ ] Hide completed hotspots during render.

Inside `renderCityHotspots(scene)`, before creating the `button`, add:

```js
if (hasFoundHotspot(cityKey, hs.id)) return;
```

Remove or ignore:

```js
if (hasFoundHotspot(cityKey, hs.id)) btn.classList.add('is-found');
```

- [ ] Shorten observation text before display.

Add helper near `showHotspotObservation`:

```js
function shortObservationCopy(text) {
  const copy = String(text || '').replace(/\s+/g, '');
  if (copy.length <= 48) return copy;
  const cut = copy.slice(0, 46);
  return cut.replace(/[，。；、：]$/, '') + '…';
}
```

Update `showHotspotObservation`:

```js
const copy = shortObservationCopy(hs.desc || hs.name || '');
```

- [ ] Keep invisible hit area 44px and shrink visible dot.

Update hotspot CSS to use a pseudo-element:

```css
.hotspot {
  min-width: 44px;
  min-height: 44px;
  background: transparent;
  border: 0;
}
.hotspot::before {
  content: "";
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(166, 58, 42, 0.9);
  box-shadow: 0 0 0 6px rgba(166, 58, 42, 0.14), 0 8px 18px rgba(25, 18, 10, 0.26);
}
.hotspot:hover::before,
.hotspot:focus-visible::before,
.hotspot.is-observation-open::before {
  transform: scale(1.08);
  background: rgba(184, 52, 39, 0.94);
}
```

If existing `.hotspot` already uses `::before` or nested children, adapt this without changing the 44px hit area.

- [ ] Redesign observation tooltip as translucent scene overlay.

Replace `.hotspot-observation` styling with:

```css
.hotspot-observation {
  --ho-x: 50%;
  --ho-y: 50%;
  position: absolute;
  z-index: 12;
  left: var(--ho-x);
  top: var(--ho-y);
  width: min(260px, calc(100% - 42px));
  transform: translate(-50%, calc(-100% - 12px));
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  pointer-events: none;
  background: rgba(28, 23, 17, 0.48);
  border: 1px solid rgba(246, 240, 226, 0.28);
  box-shadow: 0 10px 24px rgba(15, 10, 6, 0.24);
  backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.16s ease, transform 0.18s ease, visibility 0.16s;
}
.hotspot-observation p {
  margin: 0;
  font-family: var(--font-zh);
  font-size: 12px;
  line-height: 1.55;
  letter-spacing: 0.04em;
  color: rgba(255, 250, 238, 0.9);
}
.ho-mark {
  width: 18px;
  height: 18px;
  background: rgba(166, 58, 42, 0.72);
  color: rgba(255, 250, 238, 0.9);
  font-size: 11px;
}
```

- [ ] Run `npm run check:syntax && npm run check:stability`.

Expected: PASS and completed hotspots no longer render in the city scene.

---

### Task 5: Strip DSE Tags From Player-Facing Text

**Files:**
- Modify: `src/intro.js`
- Modify: `tests/stability-checks.mjs`

- [ ] Add a visible-text sanitizer.

Place near `escapeHTML` or other text helpers:

```js
function stripDseTag(text) {
  return String(text || '')
    .replace(/（DSE：[^）]*）/g, '')
    .replace(/\\(DSE:[^)]*\\)/g, '')
    .replace(/DSE\\s*[·：:][^。；\\n]*/g, '')
    .replace(/\\s+([。；，])/g, '$1')
    .trim();
}
```

- [ ] Apply `stripDseTag` to evidence explanations shown in the modal.

Where option/task feedback or `explain` text is set into `etFeedback`, use:

```js
feedback.textContent = stripDseTag(explainText);
```

If the current code directly uses `task.explain`, `opt.explain`, `choice.explain`, or `hs.evidenceText`, wrap only the player-facing modal output. Do not mutate the source data.

- [ ] Apply `stripDseTag` to event/payoff/challenge result text when those strings may include DSE tags.

Use:

```js
setText('emPayoff', stripDseTag(choice.payoff));
```

Keep internal `dse` fields intact.

- [ ] Keep explicit homepage course label unchanged unless it appears in gameplay flow.

The approved removal target is gameplay labels like `DSE：洋務背景 · 內憂／財政`, not necessarily the landing-page subject marker `DSE 中 國 歷 史 · 洋 務 運 動`.

- [ ] Run `npm run check:syntax && npm run check:stability`.

Expected: PASS and no visible modal text includes `DSE：` or `DSE ·`.

---

### Task 6: Full Verification And Browser Walkthrough

**Files:**
- No code edits unless verification reveals a defect.

- [ ] Run the full local check suite.

```bash
npm run check:syntax
npm run check:stability
npm run check:assets
npm run build
```

Expected:

- `check:syntax`: PASS.
- `check:stability`: PASS.
- `check:assets`: PASS.
- `build`: PASS with Vite bundle output.

- [ ] Browser verify on `http://localhost:5173/`.

Use an unfinished city hotspot such as Guangzhou `虎 門 炮 台` when available.

Check:

- Red point is visually smaller.
- Red point hit area remains easy to tap/click.
- Hover/tap observation is short and translucent.
- Completed hotspot disappears after task completion.
- Evidence completion shows only a brief confirmation.
- Linked event opens automatically.
- Event modal does not show rhythm rail, inquiry scaffold, or decision trace block.
- Event/gameplay text does not show `DSE：` or `DSE ·`.
- Browser console has no errors.

- [ ] Responsive spot checks.

Use these viewports:

- Desktop: `1280x720` or current browser size.
- iPad: `1024x768`.
- Mobile: `390x844`.

Check:

- Observation tooltip does not overflow.
- Event modal text remains readable.
- Hotspot hit targets remain comfortable.
- No horizontal overflow.

---

## Self-Review

- Spec coverage: All A3.5 requirements are mapped to Tasks 1-6.
- Scheme B/C exclusion: No handscroll review sidebar, no archive ceremony, no manual `入 局 →` archive button.
- Placeholder scan: No placeholder markers or deferred implementation language remains.
- Type consistency: Function names are stable: `showEvidenceCollectedToast`, `shortObservationCopy`, `stripDseTag`, and existing `finishEvidenceReveal`.
- Scope boundary: No backend, logger, Supabase, deployment, or research document changes.
