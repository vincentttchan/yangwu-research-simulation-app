# Task 21: Mobile Map Readability Design

Date: 2026-06-14

## Purpose

The current mobile map is technically stable but visually crowded. On a 390px-wide phone viewport, the persistent event list, resource/stat panel, route/date strip, and journal button compress the actual map-reading area. Players can operate the game, but the screen feels like a desktop HUD squeezed into a phone. This weakens the intended "踏遍九州" map experience and makes several cities hard to notice.

Task 21 redesigns the mobile and iPad map layout so the map becomes the primary visual surface again. It does not change research IDs, event IDs, scoring logic, route logic, Supabase logging, or historical content.

## Design Principle

Mobile should use a map-first disclosure model:

- show the map and city seals first;
- keep only essential status visible;
- collapse secondary information into small, reachable controls;
- let the player open detail panels deliberately.

The player should feel that they are navigating an historical map, not managing a dashboard.

## Recommended Approach

Use Approach A: Mobile Map Priority Mode.

### Mobile default state

For viewports up to approximately 640px wide:

- Keep the antique map as the main full-screen layer.
- Keep the top route/date strip, but make it shorter and less dominant.
- Keep the current city / next destination information as one compact task chip.
- Keep the journal button visible as a small, clear action.
- Collapse the event timeline into a bottom-left drawer tab, for example `史事 3/12`.
- Collapse the resource/stat panel into a compact button or mini stack, for example `四方 62/46/50/43` or a seal-like icon.
- Do not show long event lists and full resource bars by default.
- Do not cover the lower-middle map area with permanent panels.

### iPad default state

For tablet widths around 768-1024px:

- Keep the left event panel and right resource panel available, but reduce their footprint.
- Use narrower panels, lower visual weight, and stronger map transparency discipline.
- Keep the central and lower-central map area open.
- The iPad version may show more persistent information than mobile, but should still avoid feeling boxed in.

## Mobile HUD Structure

### Layer 1: Always Visible

These elements remain visible on mobile:

- year / season / route state;
- current or next objective in one compact chip;
- city seals and route markers;
- journal button;
- optional sound/help control if it does not compete with map reading.

### Layer 2: Collapsed Drawers

These are visible only as compact triggers:

- event timeline;
- resources / historical thinking progress;
- network / known persons, if needed later.

Drawer triggers should have at least 44px touch targets where possible.

### Layer 3: Open Panels

When a drawer is opened:

- it may cover part of the map temporarily;
- it should be easy to close;
- only one major drawer should be open at a time on mobile;
- the open drawer should not fight with the hand-scroll journal modal.

## Map Visibility Rules

The mobile map should meet these visual rules:

- No horizontal overflow at 390x844.
- At least the current city, one near-future city, and one distant locked city should be visible or discoverable without opening panels.
- City labels should remain legible against the map.
- Locked/future cities may be quieter, but should not disappear entirely.
- UI panels should not permanently obscure the main coastal route corridor.
- The map should feel usable in portrait orientation without requiring device rotation.

## City Visibility Strategy

Use CSS-first adjustments before changing map data:

1. Reduce persistent HUD coverage.
2. Slightly adjust mobile `.map-pan` scale/translation if necessary.
3. Keep the city-seal coordinate system unchanged unless a visual QA pass proves the map framing itself is wrong.

Changing `CITIES` coordinates is out of scope for Task 21 unless the map asset or coordinate calibration is proven incorrect.

## Interaction Rules

- Tapping the collapsed event drawer opens the event timeline.
- Tapping the collapsed resource/stat control opens the full resource panel.
- Tapping the journal button opens `手卷 · 書記日誌`.
- Opening the journal should close or visually subordinate other mobile drawers.
- Closing a panel returns to the clean map-first state.

## Out of Scope

- Supabase or research logging changes.
- APP_VERSION change unless a later implementation pass decides this UX change should be versioned.
- City/event content rewriting.
- New map asset generation.
- Portrait image compression.
- Full pinch-zoom/pan map engine.
- Rebuilding the route or event progression system.

## Acceptance Criteria

### Mobile 390x844

- The default map view has no horizontal overflow.
- The event timeline is collapsed by default.
- The resource/stat panel is collapsed or substantially reduced by default.
- The journal button is visible and clickable.
- Opening and closing the journal keeps the card within the viewport.
- The map shows more usable geographic area than the current crowded layout.
- At least three city labels/seals are visible or discoverable in the default map state.
- Console shows no relevant app errors or warnings.

### iPad 1024x768

- The map remains readable with left/right panels present or semi-present.
- Panels do not dominate the central map area.
- Journal opens within the viewport and footer actions remain visible.
- No horizontal overflow.
- Console shows no relevant app errors or warnings.

### Regression

- `npm run check:syntax` passes.
- `npm run check:assets` passes.
- `npm run check:stability` passes.
- `npm run build` passes.
- Existing research/login/Supabase routes are not modified.

## Implementation Notes

Likely files:

- `src/style-explore.css` for responsive HUD layout, drawer states, map framing, touch targets, and panel sizing.
- `src/intro.js` only if mobile drawer open/close state requires JavaScript beyond existing collapse controls.
- `index.html` only if a new compact mobile trigger is impossible with existing markup.

Prefer CSS-first implementation. Add JavaScript only when state coordination is necessary.

## QA Plan

Use local browser QA at:

- desktop: 1280x720;
- iPad: 1024x768;
- mobile: 390x844.

Capture screenshots for:

- mobile default map;
- mobile event drawer open;
- mobile resource/stat drawer open;
- mobile journal open;
- iPad default map;
- iPad journal open.

Check:

- map area visibility;
- city label visibility;
- drawer touch targets;
- no text overlap;
- no horizontal overflow;
- no console errors/warnings.

## Research Fit

This change supports the study design because mobile usability affects exposure quality. If students cannot comfortably see the map and city choices, differences in event engagement may reflect interface friction rather than historical thinking. A map-first mobile layout protects the learning environment while keeping the research instrumentation stable.
