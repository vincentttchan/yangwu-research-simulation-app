# Task 31 Rendered Responsive UI Readiness

Status: partial pass; map rendered QA still pending after the next UI update  
Formal research data collection status: not approved  
Relationship to Task 28: real iPad and phone QA remains deferred until the UI update is complete

## Purpose

Task 31 records the pre-real-device responsive UI audit requested after deciding that physical iPad and phone testing should wait until the interface update is complete.

This task does not replace Task 28. It is a local rendered QA checkpoint to reduce avoidable layout risk before using real classroom devices.

## Decision

Current Task 31 decision: `Partial Pass / Continue UI Update First`

Reason:

- Static and build gates passed.
- The local rendered entry and character-selection flow were checked at desktop, iPad, and phone-sized viewports.
- The latest character-selection design currently behaves as a showcase layout: one main route card plus three side candidate cards.
- Phone-sized character selection at `390 x 844` showed no horizontal overflow, and the active route CTA remained visible.
- Real iPad and phone testing should still wait until the UI update is complete.
- The in-app browser tab became unstable during the mobile route-to-map transition, so the map rendered QA must be repeated later.

## Checks Completed

| Check | Result | Notes |
|---|---|---|
| `npm run check:syntax` | Pass | No syntax errors. |
| `npm run check:stability` | Pass | Stability rules passed. |
| `npm run check:assets` | Pass | Asset references passed, including new BGM references. |
| `npm run check:mobile-ipad-ui-gate` | Pass | Task 30 gate file/check script passed. |
| `npm run build` | Pass | Vite build completed. One non-blocking chunking warning remained. |
| `npm run check:task28-real-device-qa` | Pass | Checklist integrity passed; real device rows still TBC. |
| `npm run check:formal-data-collection-gate` | Pass | Gate integrity passed; final decision remains No-Go. |

## Rendered QA Completed

Test surface: local Vite app at `http://127.0.0.1:5173/?mode=research`

Browser path:

- Browser plugin was available and used first.
- In-app browser worked for entry and selection checks.
- In-app browser later lost the tab during the route-to-map transition, so map rendered QA remains pending.
- Chrome fallback was not used because it would require separate approval.

## Viewport Results

| Viewport | Surface checked | Result |
|---|---|---|
| `1280 x 720` | Entry and character selection | Pass after transition settled; no horizontal overflow. |
| `1024 x 768` | Character selection | Pass; CTA visible, no horizontal overflow. |
| `768 x 1024` | Character selection | Pass; CTA visible, no horizontal overflow. |
| `430 x 932` | Character selection | Pass; CTA visible, no horizontal overflow; lower candidate cards require vertical scroll as expected. |
| `390 x 844` | Fresh entry and character selection | Pass; selection screen reached `x = 0`, CTA visible, no horizontal overflow. |

## Important Observation

The current character-selection implementation intentionally uses:

- `s2c-stage is-deck is-showcase`
- one active main route card;
- three smaller locked candidate cards.

This should be treated as the current UI direction unless the next UI update intentionally returns to four equal cards.

## Pending Before Real Device QA

- Repeat rendered QA after the Task 30 mobile/iPad stabilisation override.
- Confirm route-to-map transition at `390 x 844`.
- Confirm mobile map default state.
- Confirm event drawer open/close.
- Confirm stats drawer open/close.
- Confirm journal open/close.
- Confirm one city scene opens on phone-sized viewport.
- Confirm evidence task modal fits phone portrait.
- Confirm historical event modal height and footer reachability.
- Confirm production deployment matches the locally tested UI.

## Current Recommendation

Continue UI update first. Do not start real iPad or phone Task 28 testing yet.

Update on 2026-06-15:

The first UI update for Task 30 has been implemented as a protective mobile/iPad CSS override. It targets map panel coverage, journal and city mission sheet scrolling, evidence task modal height, event modal footer reachability, and touch target size. This does not complete Task 31B; it creates the version that now needs rendered route-to-map QA.

Local Browser smoke evidence after the override:

- `390 x 844` local dev mode loaded without a Vite error overlay.
- Entry to character selection succeeded; selection screen document width and scroll width both stayed at `390`.
- The active route CTA was visible and usable.
- The route cutscene reached `screen3` with `data-phase="6"`.
- At phase 6, document width and scroll width both stayed at `390`; console logs showed no error or warning entries.
- Full drawer, journal, city, evidence task modal, and event modal interaction proof remains pending because the in-app Browser tab again became unstable during the repeated route-to-map pass.

After the UI update, run:

```bash
npm run check:syntax
npm run check:stability
npm run check:assets
npm run build
npm run check:mobile-ipad-ui-gate
```

Then repeat rendered QA and proceed to Task 28 real devices only if the route-to-map and map/mobile modal flow pass.

## Follow-up Handoff

The unfinished route-to-map and mobile map checks have been separated into `docs/task-31b-route-to-map-mobile-qa-handoff.md`.

Task 31B should be completed after the UI update and before Task 28 real iPad / phone / school Wi-Fi QA.
