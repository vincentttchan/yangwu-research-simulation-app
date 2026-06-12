# A3.4 Hover Observation And Lightweight Evidence Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the visible observation layer out of the evidence modal and into city hotspot hover/tap, then reduce the evidence/event UI to a lighter, more immersive flow.

**Architecture:** Keep existing hotspot, evidence-task, and event data structures intact. Add a city-level observation tooltip driven by hotspot descriptions, change evidence reveal to a compact evidence-card confirmation, and visually de-emphasize the event inquiry scaffold without removing internal evidence linkage.

**Tech Stack:** Vite, vanilla JavaScript in `src/intro.js`, CSS in `src/style-explore.css`, HTML placeholders in `index.html`, Node stability checks in `tests/stability-checks.mjs`.

---

### Task 1: Lock the A3.4 interaction contract with tests

**Files:**
- Modify: `tests/stability-checks.mjs`

- [x] Add assertions that the city scene contains `id="hotspotObservation"` and `id="hoText"`.
- [x] Add assertions that `src/intro.js` defines `showHotspotObservation`, `hideHotspotObservation`, and wires pointer/touch events from hotspot buttons.
- [x] Add assertions that evidence reveal no longer displays a rail or stage labels and uses compact copy such as `已 入 卷`.
- [x] Add assertions that event inquiry scaffold can be visually minimized with `event-modal[data-evidence-linked="true"] .em-inquiry-scaffold`.
- [x] Run `npm run check:stability` and verify it fails on the missing new selectors/helpers.

### Task 2: Add city hotspot observation layer

**Files:**
- Modify: `index.html`
- Modify: `src/intro.js`
- Modify: `src/style-explore.css`

- [x] Add a hidden `.hotspot-observation` element inside the city scene near the hotspot layer.
- [x] In hotspot rendering, set `data-observation` from `hs.desc`.
- [x] On pointer enter/focus/touch, display the observation layer near the hotspot using CSS custom properties `--ho-x` and `--ho-y`.
- [x] On pointer leave/blur and when modals open, hide the observation layer.
- [x] Keep touch targets at least 44px.

### Task 3: Convert evidence reveal into a compact evidence card

**Files:**
- Modify: `src/intro.js`
- Modify: `src/style-explore.css`

- [x] Change `renderEvidenceRevealStep` so the post-task reveal is a single compact card headed `已 入 卷`.
- [x] Show only the hotspot name and one short source/evidence sentence.
- [x] Change the submit button to `入 局 →` when a linked event is available, or `收 起` when only collecting evidence.
- [x] Preserve `finishEvidenceReveal` behavior for locked events and event opening.

### Task 4: Reduce event scaffold visual weight

**Files:**
- Modify: `src/style-explore.css`

- [x] When an event has linked evidence, collapse `.em-inquiry-scaffold` into a subtle one-line context strip.
- [x] Keep the content in DOM for accessibility and future research logging, but make it secondary to event setup and choices.

### Task 5: Verify

**Commands:**
- `npm run check:syntax`
- `npm run check:stability`
- `npm run check:assets`
- `npm run build`

**Browser Checks:**
- On `http://localhost:5173/`, enter a city with hotspots.
- Hover or tap a red hotspot and confirm the observation appears before opening the task.
- Complete one evidence task and confirm the reveal is a compact card, not a staged scaffold.
- Open the linked event and confirm choices dominate the scene, with no worksheet-like scaffold labels.
- Check desktop, iPad, and mobile widths for no horizontal overflow and readable text.
