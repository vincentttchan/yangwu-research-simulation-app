# A3.5 Frontstage Scaffold Removal Design

## Decision

Use Scheme A only. The frontstage game flow should remove explicit scaffold panels and teacher-facing labels. Evidence, reasoning, and DSE alignment remain available in data structures where useful, but they should not appear as visible worksheet-like UI during play.

## Problem

The current event and evidence flow still feels too instructional. Labels such as `案 由`, `線 索`, `局 勢`, `抉 擇 回 聲`, `證 據 入 卷`, and visible `DSE：...` tags make the interface feel like a note sheet or exam marking page. The red hotspot observation card is also too large, too text-heavy, and stylistically detached from the city scene.

## Target Experience

The player should experience a simple game rhythm:

1. Notice a small red point in the scene.
2. Hover or tap to see a short atmospheric observation.
3. Click into a compact evidence task.
4. Complete the task.
5. Receive a very brief confirmation.
6. Move directly into the linked event when available.
7. Make a choice and see the result without scaffold labels.

The player should infer historical relationships through scene text, evidence tasks, event setup, choices, and consequences. The interface should not name the reasoning steps for them.

## Required Changes

### 1. Remove Visible Event Scaffolds

Remove the visible event scaffold regions from the player-facing modal:

- Remove or hide `emInquiryScaffold` from the event modal.
- Remove `案 由`, `線 索`, and `局 勢` as visible labels.
- Remove `emDecisionTrace` and `抉 擇 回 聲` as a visible block.
- Keep the choice result concise: selected choice, consequence text, gain badge if needed, and continue button.

### 2. Remove Event Rhythm Rail

Remove the top rhythm rail from the event modal:

- Remove visible `境 / 擇 / 問 / 聲`.
- Remove visible `入境 / 抉擇 / 追問 / 回聲`.
- The modal should feel like a narrative scene, not a four-step lesson flow.

### 3. Replace Evidence Archive Modal With Brief Confirmation

Do not show a full `證 據 入 卷` page after completing an evidence task.

After success:

- Show a short, non-blocking confirmation such as `已記下：虎 門 炮 台`.
- If the hotspot unlocks an event, move directly into the event after a short beat.
- If no linked event exists, close the evidence task and return to the city scene.
- Do not require an `入 局 →` button.

### 4. Redesign Hotspots

Hotspots should be visually lighter:

- Reduce the visible red dot size.
- Preserve touch comfort by keeping the invisible button hit area at least 44px.
- Hide or remove completed hotspots from the scene.
- Avoid completed red dots remaining as visual clutter.

### 5. Redesign Observation Tooltip

Observation copy should feel like part of the scene:

- Use a semi-transparent overlay.
- Reduce text length to one short sentence where possible.
- Avoid large paper-card styling.
- Place it close to the hotspot without covering too much of the scene.
- Keep the typography and color mood consistent with the city scene.

### 6. Remove Frontstage DSE Tags

Remove visible `DSE：...` / `DSE · ...` labels from player-facing explanations and result text.

The historical alignment may remain in:

- internal data fields,
- teacher-facing future views,
- research coding,
- test fixtures if needed.

It should not appear in the live game UI.

## Non-Goals

- Do not add a handscroll review sidebar for this sprint.
- Do not add a ceremonial evidence archive transition.
- Do not redesign the whole event modal visual language beyond removing the scaffolding and reducing friction.
- Do not change backend/research logger work in this UX thread.

## Acceptance Criteria

- Event modal no longer shows `案 由`, `線 索`, `局 勢`, `抉 擇 回 聲`, `境`, `擇`, `問`, `聲`, `入境`, `追問`, or `回聲` as UI scaffolds.
- Evidence task completion no longer opens a full `證 據 入 卷` archive card.
- Linked evidence task completion automatically proceeds into the event after a short confirmation.
- Player-facing text no longer displays `DSE：` or `DSE ·`.
- Red hotspots are visually smaller while retaining 44px hit targets.
- Completed hotspots disappear from the city scene.
- Observation tooltip is shorter, semi-transparent, and visually integrated with the city scene.
- Existing checks pass: `npm run check:syntax`, `npm run check:stability`, `npm run check:assets`, and `npm run build`.
- Browser walkthrough verifies one unfinished hotspot through task completion and linked event opening on `http://localhost:5173/`.

## Self-Review

- No placeholders remain.
- Scope is limited to frontstage interaction and visual rhythm.
- Scheme B and Scheme C are explicitly excluded.
- Backend, research logger, and deployment are out of scope.
