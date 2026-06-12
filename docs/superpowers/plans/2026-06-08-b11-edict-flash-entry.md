# B1.1 Edict Flash Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the large post-cutscene objective card with a short cinematic edict flash that auto-enters the map.

**Architecture:** Keep the existing `objectiveCard` hook so the map transition flow remains stable. Redesign the markup and CSS into a compact seal/edict overlay, and update `showObjectiveCard()` to auto-dismiss while allowing click/tap skip.

**Tech Stack:** Vite, vanilla JavaScript, HTML, CSS, existing stability checks.

---

### Task 1: Redesign Objective Markup

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/index.html`

- [ ] Replace the large rules-oriented objective card content with compact edict copy:
  - Kicker: `奉 旨`
  - Title: `啟 程`
  - Lede: `各城卷宗已展。往其地，察其證，定其局。`
  - Hint: `點 擊 可 略 過`

### Task 2: Auto-Dismiss Entry Logic

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/intro.js`

- [ ] Update `showObjectiveCard(onBegin)` so it:
  - Shows the compact overlay.
  - Automatically calls `onBegin()` after roughly 1100ms.
  - Lets click/tap/keyboard proceed immediately.
  - Cleans listeners and hides the overlay after leaving.

### Task 3: Cinematic Styling

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/src/style-explore.css`

- [ ] Override objective-card styling into a small centered edict flash:
  - Dark transparent overlay.
  - Small vertical scale rise.
  - Seal pulse and short text.
  - No large rule blocks.
  - Reduced-motion friendly.

### Task 4: Stability Checks

**Files:**
- Modify: `/Users/vincentttchan99/Desktop/洋務運動遊戲/探索版/tests/stability-checks.mjs`

- [ ] Assert objective card no longer contains the old rule list/principles.
- [ ] Assert `showObjectiveCard()` contains timer-based auto entry.
- [ ] Assert click/keyboard skip remains available.

### Task 5: Verification

- [ ] Run `npm run check:syntax`
- [ ] Run `npm run check:stability`
- [ ] Run `npm run check:assets`
- [ ] Run `npm run build`
- [ ] Browser-check that after route cutscene the edict overlay is brief and map phase proceeds.
