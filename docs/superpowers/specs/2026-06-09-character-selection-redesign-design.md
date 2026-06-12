# Character Selection Redesign: Person-As-World Stage

## Scope

This redesign only covers the character selection page. It does not change the entrance rhythm, the four-page opening transition, the second "啟程入局" ritual confirmation, the short route transition, or the map flow.

Current confirmed rhythm:

`入局 → 人物選擇頁 → 四頁轉場 → 第二次「啟程入局」作為儀式性確認 → 短轉場 → 地圖`

## Design Principle

The character selection page should feel like choosing a historical viewpoint, not browsing a character database. Each character page should be a complete cinematic stage: portrait, atmosphere, route tension, and one clear action.

The page should follow the "人物即世界" direction:

- The portrait becomes part of the full-screen visual field.
- The character is encountered one page at a time.
- The UI avoids showing the full roster upfront.
- The player discovers other characters by moving left or right.
- Character information is minimal, atmospheric, and tied to route perspective.

## Navigation

Remove the visible character-name list / top pills.

Use only:

- Left arrow
- Right arrow
- Minimal pagination dots, such as `● ○ ○ ○`

The player should not see all character names at once. This preserves discovery and reduces the feeling of a menu or database.

The arrows should have comfortable touch targets for iPad and mobile. Swiping can be supported if it already fits the current carousel structure, but arrows remain the visible control.

## Layout

Each character page should be composed as a full-stage historical poster:

- Left side: character text block.
- Right / background: portrait blended into the full visual stage.
- Background: dark copperplate / late-Qing archival atmosphere.
- No hard vertical split between portrait and text.
- No card-within-card presentation.

The portrait should be treated as atmosphere, not as a separate framed profile image.

## Information Hierarchy

Recommended text hierarchy for each character:

1. Small route marker: `首 卷 路 線`
2. Character name: `李 鴻 章`
3. Route tagline: `自江南煙囪起筆，親歷自強盛衰`
4. Core route tension: `船炮可造，制度未必肯動。`
5. Short route description: one to two lines only.
6. CTA: `擇 此 人 物 →`

The page should not explain all gameplay systems. It should not repeat the four-page opening historical background.

## De-Emphasised Elements

The following should be visually reduced or hidden from the first reading layer:

- Ability lists
- Star ratings
- Difficulty labels
- Route tags
- Explicit system explanations

If retained, these elements should be secondary and subdued, appearing as faint route texture rather than a primary decision panel.

## Selection State

The first click on `擇 此 人 物 →` should still matter. It may shift the page into a selected / committed state, but it should feel ritualistic rather than administrative.

The second `啟程入局` remains. It is a deliberate immersion device, not a redundant confirmation.

Selection state can:

- Darken or focus the background.
- Bring the core route tension forward.
- Change the CTA to `啟 程 入 局 →`.
- Prepare the player emotionally for the four-page opening transition.

It should not add extra explanatory panels.

## Visual References To Borrow

From immersive Awwwards-style storytelling:

- Full-bleed composition.
- Large image atmosphere.
- Sparse text.
- One dominant CTA.
- Strong hierarchy and cinematic pacing.

From award-winning narrative games:

- Character selection as a viewpoint, not a stat sheet.
- UI that feels embedded in the historical world.
- Route identity expressed through mood, typography, and tension.

## Acceptance Criteria

- The character selection page no longer shows a full visible roster of character names.
- Character switching uses left/right arrows and pagination dots.
- Each character appears as a full-stage scene rather than a split profile card.
- The portrait blends into the whole composition.
- The primary text block is concise and readable on desktop and iPad.
- The CTA is visually shorter and clearer than the current overly long red frame style.
- The second `啟程入局` ritual confirmation remains.
- The four-page opening transition remains unchanged in sequence.
- No research logger, backend, data collection, or map-flow files are touched for this redesign.

## Implementation Boundary

Likely files for a future implementation sprint:

- `src/style-explore.css` for visual redesign.
- `src/intro.js` only if the current carousel markup requires navigation or selected-state adjustment.
- `tests/stability-checks.mjs` for regression guards.

No implementation should start until this design is reviewed and approved.
