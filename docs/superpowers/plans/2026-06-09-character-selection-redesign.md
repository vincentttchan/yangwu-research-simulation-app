# Character Selection Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign only the character selection page so it feels like a cinematic historical viewpoint selector rather than a character database.

**Architecture:** Keep the existing Screen 2 carousel, left/right arrows, dots, and two-step CTA. Add regression guards first, then make narrowly scoped changes in `src/intro.js` and `src/style-explore.css` to remove roster-like naming, suppress ability/stat surfaces, and refine the full-stage composition. Do not change the entrance rhythm, four-page opening transition, second `啟程入局`, short transition, map, logger, or backend.

**Tech Stack:** Vite, vanilla JavaScript, CSS, static stability assertions in `tests/stability-checks.mjs`.

---

## File Structure

- Modify: `tests/stability-checks.mjs`
  - Add guards for the new character-selection design boundary and visual requirements.
- Modify: `src/intro.js`
  - Keep `CAROUSEL_DATA`, arrows, dots, and two-step CTA.
  - Change dot accessible labels from visible character names to generic witness positions.
  - Prevent portrait clicks from opening the old ability-panel flip surface.
  - Keep route selection and `showCutscene(route)` behavior unchanged.
- Modify: `src/style-explore.css`
  - Append a new scoped block: `Sprint D1 · Character Selection Redesign`.
  - Hide/de-emphasise ability/stat/tag surfaces from the first reading layer.
  - Refine full-stage portrait/text composition, CTA width, arrows, and dots.

No files outside these three should be touched for this sprint.

---

### Task 1: Add Character Selection Regression Guards

**Files:**
- Modify: `tests/stability-checks.mjs`

- [ ] **Step 1: Add failing stability assertions**

Add these assertions after the existing C3 selection assertions:

```js
assert.doesNotMatch(intro, /dot\.setAttribute\('aria-label',\s*`跳至 \$\{c\.name\}`\)/, 'Character selection dots should not reveal the full roster by name');
assert.match(intro, /dot\.setAttribute\('aria-label',\s*`第 \$\{i \+ 1\} 位見證者`\)/, 'Character selection dots should use generic witness labels');
assert.doesNotMatch(intro, /const portrait = e\.target\.closest\('\.s2c-portrait-wrap'\);[\s\S]*slide\.classList\.toggle\('is-flipped'/, 'Character selection portraits should not open a foreground ability/stat flip panel');
assert.match(css, /Sprint D1 · Character Selection Redesign[\s\S]*\.screen--selection \.s2c-ability-panel[\s\S]*display:\s*none\s*!important/, 'Character selection should hide ability panels from the first reading layer');
assert.match(css, /Sprint D1 · Character Selection Redesign[\s\S]*\.screen--selection \.s2c-tags[\s\S]*display:\s*none\s*!important/, 'Character selection should hide route tags and stars from the first reading layer');
assert.match(css, /Sprint D1 · Character Selection Redesign[\s\S]*\.screen--selection \.s2c-cta[\s\S]*width:\s*min\(242px,\s*72vw\)/, 'Character selection CTA should be visually shorter and focused');
assert.match(css, /Sprint D1 · Character Selection Redesign[\s\S]*\.screen--selection \.s2c-arrow[\s\S]*min-width:\s*52px[\s\S]*min-height:\s*52px/, 'Character selection arrows should remain comfortable touch targets');
```

- [ ] **Step 2: Run the stability check and confirm it fails**

Run:

```bash
npm run check:stability
```

Expected result: FAIL on one of the new `Character selection` assertions because D1 is not implemented yet.

---

### Task 2: Remove Roster-Like Naming From Dot Navigation

**Files:**
- Modify: `src/intro.js`

- [ ] **Step 1: Change dot accessible labels**

In `renderCarousel()`, replace:

```js
dot.setAttribute('aria-label', `跳至 ${c.name}`);
```

with:

```js
dot.setAttribute('aria-label', `第 ${i + 1} 位見證者`);
```

This keeps accessibility while avoiding an up-front named roster.

- [ ] **Step 2: Run syntax and stability checks**

Run:

```bash
npm run check:syntax && npm run check:stability
```

Expected result: syntax passes; stability still fails on the remaining portrait flip / CSS D1 assertions.

---

### Task 3: Stop Portrait Flip From Acting Like an Ability Panel

**Files:**
- Modify: `src/intro.js`

- [ ] **Step 1: Make portrait wrapper atmospheric instead of interactive**

Inside `renderCarousel()`, replace the portrait wrapper opening tag:

```js
<div class="s2c-portrait-wrap" role="button" tabindex="0" aria-label="切換人物能力頁" aria-pressed="false">
```

with:

```js
<div class="s2c-portrait-wrap" aria-hidden="true">
```

- [ ] **Step 2: Remove portrait click flipping from the delegated click handler**

Inside `s2Bind()`, replace:

```js
const portrait = e.target.closest('.s2c-portrait-wrap');
if (portrait) {
  const slide = portrait.closest('.s2c-slide');
  const flipped = !slide.classList.contains('is-flipped');
  slide.classList.toggle('is-flipped', flipped);
  portrait.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  return;
}
```

with:

```js
const portrait = e.target.closest('.s2c-portrait-wrap');
if (portrait) return;
```

- [ ] **Step 3: Neutralise the old portrait keyboard flip branch**

Inside the `s2Stage?.addEventListener('keydown', ...)` handler near the end of `s2Bind()`, replace:

```js
if (!portrait) return;
e.preventDefault();
portrait.click();
```

with:

```js
if (!portrait) return;
e.preventDefault();
```

- [ ] **Step 4: Run syntax and stability checks**

Run:

```bash
npm run check:syntax && npm run check:stability
```

Expected result: syntax passes; stability still fails only on CSS D1 assertions.

---

### Task 4: Add Full-Stage Character Selection CSS

**Files:**
- Modify: `src/style-explore.css`

- [ ] **Step 1: Append the D1 CSS block**

Append this block after the existing `Sprint C3 · First Loop Repair` block:

```css
/* ============================================================
   Sprint D1 · Character Selection Redesign
   ============================================================ */
.screen--selection .s2c-slide {
  background:
    radial-gradient(ellipse 54% 82% at 78% 48%, rgba(224, 196, 132, 0.15), transparent 64%),
    linear-gradient(90deg, rgba(5, 4, 3, 0.98) 0%, rgba(8, 5, 3, 0.95) 34%, rgba(13, 9, 6, 0.58) 58%, rgba(6, 5, 3, 0.82) 100%) !important;
}

.screen--selection .s2c-rec {
  display: inline-flex !important;
  width: fit-content;
  border: 0;
  border-bottom: 1px solid rgba(216, 174, 96, 0.42);
  background: transparent !important;
  color: rgba(231, 202, 142, 0.84) !important;
  padding: 0 0 8px;
  margin-bottom: 18px;
  letter-spacing: 0.18em;
}

.screen--selection .s2c-num,
.screen--selection .s2c-en,
.screen--selection .s2c-meta,
.screen--selection .s2c-tags,
.screen--selection .s2c-stars,
.screen--selection .s2c-flip-hint,
.screen--selection .s2c-ability-panel {
  display: none !important;
}

.screen--selection .s2c-portrait-wrap {
  pointer-events: none;
  opacity: 0.68;
}

.screen--selection .s2c-text {
  top: clamp(116px, 17vh, 168px) !important;
  width: min(540px, 44vw) !important;
}

.screen--selection .s2c-name {
  font-size: clamp(3rem, 6vw, 5.8rem) !important;
  line-height: 1.05 !important;
  letter-spacing: 0.16em;
}

.screen--selection .s2c-route-line {
  font-size: clamp(1.05rem, 1.75vw, 1.5rem) !important;
  letter-spacing: 0.08em;
  color: rgba(238, 220, 178, 0.86) !important;
}

.screen--selection .s2c-bio {
  max-width: 520px;
  font-size: clamp(0.98rem, 1.32vw, 1.14rem) !important;
  line-height: 1.85 !important;
  color: rgba(238, 226, 202, 0.72) !important;
}

.screen--selection .s2c-cta {
  width: min(242px, 72vw);
  min-height: 58px;
  justify-content: center;
  padding: 0 22px;
  border-color: rgba(236, 203, 132, 0.72) !important;
  background: linear-gradient(90deg, rgba(117, 38, 25, 0.68), rgba(92, 29, 20, 0.5)) !important;
  color: #ecd7a0 !important;
}

.screen--selection .s2c-cta.is-chosen {
  width: min(258px, 76vw);
  background: linear-gradient(90deg, rgba(148, 47, 30, 0.78), rgba(105, 34, 24, 0.62)) !important;
}

.screen--selection .s2c-arrow {
  min-width: 52px;
  min-height: 52px;
  width: clamp(52px, 5vw, 64px);
  height: clamp(52px, 5vw, 64px);
  border-color: rgba(226, 190, 118, 0.34);
}

.screen--selection .s2c-dots {
  bottom: clamp(20px, 4vh, 42px);
}

.screen--selection .s2c-dot {
  width: 10px;
  height: 10px;
}

@media (max-width: 900px) {
  .screen--selection .s2c-text {
    top: 116px !important;
    width: min(620px, 74vw) !important;
  }

  .screen--selection .s2c-name {
    font-size: clamp(2.55rem, 9vw, 4.3rem) !important;
  }

  .screen--selection .s2c-bio {
    max-width: 74vw;
  }
}
```

- [ ] **Step 2: Run syntax and stability checks**

Run:

```bash
npm run check:syntax && npm run check:stability
```

Expected result: both pass.

---

### Task 5: Browser Visual Verification

**Files:**
- No code edits.

- [ ] **Step 1: Open the local game**

Use the in-app browser at:

```text
http://127.0.0.1:5173/
```

If the dev server is not running, start it with:

```bash
npm run dev
```

- [ ] **Step 2: Verify desktop character selection**

Walkthrough:

1. Open landing page.
2. Click `入局啟程`.
3. Confirm character selection page shows only arrows and dots for switching.
4. Confirm no top named roster appears.
5. Confirm ability/stat flip panel does not appear when clicking the portrait.
6. Confirm `擇 此 人 物 →` changes to `啟 程 入 局` on first click.
7. Confirm second click still enters the existing four-page opening transition.

Expected result: entrance rhythm remains unchanged.

- [ ] **Step 3: Verify iPad viewport**

Set viewport to approximately:

```text
1024 x 768
```

Expected result:

- Text remains readable.
- Arrows remain comfortable touch targets.
- CTA remains shorter than the old long red frame.
- Portrait still reads as background atmosphere, not a right-side card.

- [ ] **Step 4: Verify mobile viewport**

Set viewport to approximately:

```text
390 x 844
```

Expected result:

- Text does not overlap portrait or arrows.
- CTA remains tappable.
- Dots remain visible.
- No roster list appears.

---

### Task 6: Final Verification

**Files:**
- No code edits.

- [ ] **Step 1: Run all available project checks**

Run:

```bash
npm run check:syntax && npm run check:stability && npm run check:assets && npm run build
```

Expected result: all commands complete successfully.

- [ ] **Step 2: Confirm git scope**

Run:

```bash
git status --short
```

Expected result: changes for this sprint should be limited to:

```text
src/intro.js
src/style-explore.css
tests/stability-checks.mjs
docs/superpowers/plans/2026-06-09-character-selection-redesign.md
```

The repository already contains unrelated dirty/untracked migration files; do not revert them and do not commit unless explicitly asked.

---

## Self-Review

- Spec coverage: navigation, full-stage layout, information hierarchy, de-emphasised elements, selection state, and implementation boundary are all covered.
- Scope control: this plan does not modify the entrance rhythm, four-page transition, short transition, map, research logger, backend, or data collection.
- Test-first path: Task 1 adds failing regression guards before implementation.
- No placeholders: all code snippets and commands needed for the planned edits are included.
