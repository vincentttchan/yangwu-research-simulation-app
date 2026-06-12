# A1 Map-First Mobile/iPad Main Screen Design

Date: 2026-06-08

Project: 洋務運動遊戲 / Self-Strengthening Movement historical simulation

Status: Draft for user review

## 1. Purpose

This design defines the first player-experience sprint for the game-design thread: improving the mobile and iPad main screen through a **Map-first + Bottom Mission Sheet** layout.

The goal is to make the city map remain the visual and experiential centre of the game, while giving students a stable sense of what to do next. This sprint focuses on interaction clarity and device ergonomics. It does not implement research logging, APP_VERSION tracking, backend data collection, or Supabase/Vercel deployment work.

## 2. Rationale

The game is intended for classroom research and play on desktop, iPad, and mobile devices. In that setting, students may have limited time, varied device sizes, and different levels of game literacy. If the main screen is unclear, students may spend cognitive effort on navigation rather than historical reasoning.

The selected design preserves immersion by making the historical city map the dominant element. The bottom mission sheet acts as a light scaffold: it shows the current objective, evidence status, and next action without turning the game into a worksheet.

The design should follow common touch-interface expectations for iPhone and iPad use, including comfortably sized controls and clear interaction targets. Apple’s Human Interface Guidelines for touch-based devices are a useful reference point for this principle.

## 3. Design Decision

Adopt **Map-first + Bottom Mission Sheet** as the mobile/iPad main screen model.

Use the **richer collapsed sheet** variant. Even when collapsed, the sheet should show the current objective, evidence/progress status, and one next-action cue or button. This is preferred over a minimal one-line sheet because the game will be used in a classroom research context where students need to maintain orientation without repeatedly asking the teacher what to do next.

The screen should have three persistent zones:

1. **Top status bar**
   - Shows year, city/route context, phase/progress cue, and essential controls such as return/reset/help.
   - Must stay visually quiet. It should not compete with the city map.

2. **Main city map**
   - Occupies the largest area of the screen.
   - Hotspots remain the primary interaction targets.
   - Map overlays should not cover the core city scene unless the player has triggered an event.

3. **Bottom mission sheet**
   - Collapsed by default on small screens.
   - Shows current mission, next action, evidence count/status, and a clear expand affordance.
   - Expands when tapped to show more detail, but should not cover the whole map unless the user explicitly opens a full evidence/task view.

## 4. Mobile Portrait Behaviour

For mobile portrait:

- The city map should remain the largest visible region.
- The bottom mission sheet should start in a compact collapsed state.
- The collapsed sheet should show:
  - current objective in one short line;
  - evidence/progress indicator;
  - one primary next-action button or cue;
  - expand/collapse control.
- The expanded sheet should use a half-screen style, not a full-screen takeover by default.
- The player should always be able to return to the map without closing multiple layers.
- Any primary tap target should be large enough for comfortable touch interaction.

## 5. iPad / Landscape Behaviour

For iPad and wider screens:

- The map should remain wide and panoramic.
- The mission sheet may become a lower, wider panel or a hybrid side/bottom panel depending on available space.
- The interface should avoid oversized panels that make the iPad version feel like a form or worksheet.
- The design should support classroom glanceability: a teacher should be able to see roughly where a student is in the flow from the main screen state.

## 6. Screen States

### 6.1 Entering a City

When entering a city, the map appears first. The bottom sheet is collapsed and shows a concise objective, such as:

- “前往船政局，了解技術自強的限制”
- “收集 2 項證據後作出決策”

The map should visually suggest available hotspots without overwhelming the player.

### 6.2 Exploring a Hotspot

When the player taps a hotspot:

- the selected hotspot should receive clear feedback;
- the event modal opens above the map;
- the background map should remain visually present enough to preserve location context;
- the bottom sheet does not need to remain active while the event modal is open.

### 6.3 Returning from an Event

After an event, the main screen should clearly show:

- what was gained or changed;
- whether a new evidence item was collected;
- whether a new route, stakeholder, or decision is now available;
- what the next recommended step is.

This feedback can appear as a short update inside the bottom sheet rather than as another large modal.

### 6.4 Expanding the Mission Sheet

The expanded sheet should show:

- current mission;
- evidence collected;
- available next actions;
- short historical reasoning cue where appropriate;
- optional “view evidence” or “open task” action.

It should not show long historical explanation paragraphs. Longer content belongs in events, evidence cards, or reflection tasks.

## 7. Interaction Principles

1. **Map first, scaffold second**
   - The city is the player’s anchor. The sheet supports the journey but does not dominate it.

2. **One visible next step**
   - Students should not need to infer what the game expects after every action.

3. **Return with meaning**
   - After each event, returning to the map must include feedback about consequence, evidence, or new possibility.

4. **No hidden essential action**
   - Critical controls should not rely only on hover, tiny icons, or gestures that students may not discover.

5. **Research-friendly but still playful**
   - The layout supports observable learning flow while retaining the feeling of historical exploration.

## 8. Implementation Scope for the Future Sprint

The future implementation sprint should include:

- responsive layout changes for the main city/map screen;
- bottom mission sheet component or equivalent existing-structure adaptation;
- mobile portrait and iPad layout rules;
- hotspot tap-target improvements;
- event return feedback in the bottom mission sheet;
- minimal adjustment to event modal height if it blocks the mobile map flow.

The sprint should not include:

- research APP_VERSION work;
- local-only research logger work;
- Supabase/backend integration;
- full redesign of all event writing;
- cinematic ending polish;
- major new game mechanics.

## 9. Acceptance Criteria

The design will be considered implemented when:

- mobile portrait view shows a dominant map and compact mission sheet without layout overlap;
- iPad view preserves a wide map and avoids excessive panel dominance;
- all main hotspot and primary controls are comfortable to tap;
- the bottom sheet clearly communicates the current mission and next step;
- returning from an event updates the bottom sheet with meaningful feedback;
- event modal height does not trap or hide essential controls on mobile;
- desktop layout is not regressed;
- the game remains playable through the first city flow on desktop, iPad-sized viewport, and mobile portrait viewport.

## 10. Verification Plan

Future implementation should be verified with:

- desktop browser smoke test;
- iPad-sized viewport check;
- mobile portrait viewport check;
- screenshot review for overlap, clipped text, and visual hierarchy;
- manual first-city flow test from entering the city through at least one event and return-to-map update;
- asset visibility check, since the project now uses the Vite/public asset path model.

## 11. User Decision

The user confirmed the **richer sheet** direction on 2026-06-08.

The implementation plan should therefore treat the collapsed bottom mission sheet as a compact but information-rich scaffold. It should remain visually restrained, but it must not hide the essential next step, evidence/progress cue, or expand control.
