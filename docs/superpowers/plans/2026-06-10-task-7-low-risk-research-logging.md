# Task 7 Low-Risk Research Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local-only research logging to stable game flow points without changing visible gameplay or sending data to Supabase.

**Architecture:** Add a focused `src/research/instrumentation.js` adapter that enriches payloads from `RESEARCH_CONTENT_MAP` and writes through the existing local logger. Keep `src/intro.js` changes thin: call `window.__yangwuResearch` at session start, city entry, evidence completion, event opening, decision selection, and session end.

**Tech Stack:** Vite, vanilla JavaScript modules, localStorage-backed logger, Node assertion checks.

---

### Task 1: Research Instrumentation Adapter

**Files:**
- Create: `src/research/instrumentation.js`
- Modify: `src/main.js`
- Test: `tests/research-instrumentation-check.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing test**

Create `tests/research-instrumentation-check.mjs` with assertions that instrumentation exports a browser-facing adapter, enriches event IDs with research-map metadata, and writes only to the existing local queue.

- [ ] **Step 2: Run failing test**

Run: `npm run check:instrumentation`

Expected: fail because `src/research/instrumentation.js` does not exist.

- [ ] **Step 3: Implement adapter**

Create `src/research/instrumentation.js` with `buildResearchPayload`, `logSessionStart`, `logCityEntered`, `logEvidenceTaskCompleted`, `logEventOpened`, `logDecisionSelected`, and `logSessionEnd`.

- [ ] **Step 4: Wire adapter**

Import `./research/instrumentation.js` in `src/main.js` after `content-map.js` and before `logger.js`-dependent gameplay code.

- [ ] **Step 5: Verify**

Run: `npm run check:instrumentation`.

### Task 2: Thin Game Flow Calls

**Files:**
- Modify: `src/intro.js`
- Modify: `tests/stability-checks.mjs`

- [ ] **Step 1: Write failing stability assertions**

Add assertions that `intro.js` calls:
- `logSessionStart`
- `logCityEntered`
- `logEvidenceTaskCompleted`
- `logEventOpened`
- `logDecisionSelected`
- `logSessionEnd`

- [ ] **Step 2: Run failing stability check**

Run: `npm run check:stability`

Expected: fail on missing Task 7 calls.

- [ ] **Step 3: Add thin calls**

Add non-blocking optional calls using `window.__yangwuResearch && window.__yangwuResearch.log...`. Payloads should use IDs, not visible prose.

- [ ] **Step 4: Verify**

Run: `npm run check:stability && npm run check:instrumentation`.

### Task 3: Full Verification

**Files:**
- Modify: `docs/research-id-map.md`

- [ ] **Step 1: Update documentation**

Add a Task 7 section listing the active local-only event types.

- [ ] **Step 2: Run complete checks**

Run: `npm run check:syntax && npm run check:stability && npm run check:assets && npm run check:research-map && npm run check:instrumentation && npm run build`.

- [ ] **Step 3: Browser marker check**

Open localhost and confirm `data-research-instrumentation="local-flow-v1"` appears with no console warning/error.

No git commit in this workspace because the game folder contains active uncommitted design work.
