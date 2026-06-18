# Task 30 Mobile / iPad UI Stabilisation Gate

Status: mobile/iPad stabilisation override applied; rendered QA still TBC  
Formal research data collection status: not approved  
Relationship to Task 28: complete this gate after UI updates and before real iPad / phone / school Wi-Fi QA

## Purpose

Task 30 defines the UI stabilisation gate that must sit between the next visual/interface update and the real-device Task 28 QA.

The aim is to avoid wasting a real iPad / phone / school-Wi-Fi test on a version that is still changing. Once the UI update is complete, Task 30 checks whether the research build is stable enough to be tested on real devices and eventually used in a classroom data-collection session.

This task protects both:

- gameplay usability, because students need a clear map, readable modals, and reliable touch controls;
- research validity, because poor mobile layout could distort event engagement and process data.

## Scope

Task 30 focuses on rendered UI and classroom device readiness.

In scope:

- research login on small screens;
- landing / route selection entry flow;
- map default layout;
- city labels and seals;
- event timeline drawer;
- stats / resistance drawer;
- journal / `手卷` panel;
- city mission sheet;
- hotspot observation layer;
- evidence task modal;
- historical event modal;
- coachmark / tutorial overlay;
- touch target size and text clipping;
- responsive QA before production redeploy;
- deciding whether `APP_VERSION` should remain `lkkc-pilot-v1.0` or bump to a new pilot marker after UI changes.

Out of scope:

- research IDs, event IDs, city IDs, evidence task IDs;
- Supabase schema changes;
- new research data tables;
- HEA / HNET / Transfer Task / PAQ rewriting;
- formal student data collection approval;
- final school Wi-Fi testing, which remains Task 28.

## Gate Principle

Do not run final real-device Task 28 until Task 30 is at least `Conditional Pass`.

Reason: if the map, modals, or touch controls change after Task 28, the iPad/phone/school-network result no longer proves the final version.

## Visual Acceptance Baseline

The primary visual acceptance baseline is now:

- `1280 x 720` desktop or larger;
- `1024 x 768` iPad landscape.

These two modes define the intended premium historical-game experience: readable archival UI, full map/city spatial awareness, clear source/evidence tasks, and strong late-Qing visual atmosphere.

Phone portrait remains supported as a compact access mode, not the visual design target. On phone, the acceptance threshold is functional usability:

- the player can enter the research flow;
- the map and city scenes can be panned or framed enough to find required cities/hotspots;
- drawers, journal, evidence tasks, event modals, and submit/continue controls remain reachable;
- no required red dot, city label, modal footer, or navigation control is permanently blocked.

Recommended player guidance: use desktop/laptop or iPad landscape for the best experience. Phone use is acceptable for emergency or compact testing, but it should not be used as the standard visual-quality benchmark.

## UI Surfaces To Stabilise

| Surface | Required readiness before real-device QA | Research relevance |
|---|---|---|
| Research login | Fits phone portrait; keyboard does not block submit; no real-name/contact field. | Protects pseudonymous login and consent boundary. |
| Route entry | Student can enter the game without unclear overlay traps. | Protects session-start consistency. |
| Map default state | Map remains the first visual focus; no crowded desktop HUD on phone. | Protects route/city exploration exposure. |
| City seals / labels | At least current, near-future, and side-visit cities are visible or discoverable. | Protects choice opportunity and route breadth. |
| Event timeline drawer | Collapsed by default on phone; reachable and closable. | Protects process engagement without covering map. |
| Stats / resistance drawer | Collapsed by default on phone; readable when opened. | Protects understanding of constraints without overloading viewport. |
| Journal / hand-scroll | Opens and closes within viewport; footer controls visible. | Protects student recovery and evidence review. |
| City mission sheet | Gives current task / next action without covering the whole city scene. | Protects first-loop clarity. |
| Evidence task modal | Task controls are touchable; reveal state does not clip. | Protects source engagement evidence. |
| Event modal | Historical text, decision choices, challenge/result frames fit with scroll where needed. | Protects decision sequence and argumentation prompts. |
| Coachmark overlay | Does not block normal taps after being skipped or completed. | Protects early navigation and avoids artificial event-log disruption. |

## Minimum Viewports Before Real Devices

Run local or production browser QA on these viewports before using real devices:

| Viewport | Why |
|---|---|
| `1280 x 720` desktop | Primary visual acceptance baseline and teacher/researcher control surface. |
| `1024 x 768` iPad landscape | Primary tablet visual acceptance baseline and recommended classroom tablet mode. |
| `768 x 1024` iPad portrait | Functional survivability check for rotated tablet use. |
| `430 x 932` large phone | Compact access / stress test for phone portrait. |
| `390 x 844` student-sized phone | Narrowest compact access / stress test for phone portrait. |

If any viewport fails due to overlap, scroll trap, blocked touch, or unreadable controls, fix before real-device Task 28.

## Acceptance Criteria

### Research Login

- [ ] Research login appears only with `?mode=research`.
- [ ] Participant code and session code fields fit on phone portrait.
- [ ] Submit button remains reachable after keyboard appears.
- [ ] Wrong-code feedback is readable.
- [ ] No personal-data field is shown.

### Map And Panels

- [ ] No horizontal overflow at `390 x 844`.
- [ ] Map is not covered by persistent event/stat panels on phone.
- [ ] Event timeline is collapsed by default on phone.
- [ ] Stats/resistance panel is collapsed by default on phone.
- [ ] Event and stats drawers can open and close.
- [ ] Journal button remains visible and has a practical touch target.
- [ ] iPad panels do not dominate the central map.

### City / Evidence / Event

- [ ] City scene opens without broken or blocking overlays.
- [ ] Hotspots have comfortable touch targets.
- [ ] City mission sheet does not cover critical hotspots.
- [ ] Evidence task modal fits phone portrait with reachable submit/continue control.
- [ ] Event modal has a usable height and scroll behaviour.
- [ ] Decision choices and challenge options have at least approximately 44px touch targets.
- [ ] Result / continue controls remain reachable.

### Coachmark And Recovery

- [ ] Coachmark can be skipped.
- [ ] Coachmark does not intercept taps after hidden.
- [ ] Refresh after login does not create a confusing dead end.
- [ ] Escape/back/close behaviour returns to a clear previous state where applicable.

### Research Stability

- [ ] `APP_VERSION`, `RESEARCH_COHORT`, and `content_map_version` are visible and intentional.
- [ ] UI changes do not rename route, city, event, or evidence task IDs.
- [ ] Event logging still creates core events after the UI update.
- [ ] Dry-run rows can be excluded from formal analysis.

## APP_VERSION Rule

Use this rule after the UI update:

| Change type | Version decision |
|---|---|
| Minor CSS polish only | May keep `lkkc-pilot-v1.0` if Task 30 and Task 28 notes record the change. |
| Layout/interaction changes that affect map, modal, drawer, or touch flow | Prefer bumping to `lkkc-pilot-v1.1`. |
| Content, route, event, evidence ID, or scoring changes | Treat as a stronger content/research freeze review before pilot. |

If version changes, Vercel Production, Supabase export filters, Task 20.1, Task 22, Task 28, and Task 29 must all be updated to the same version.

## Rendered QA Procedure

1. Start the local Vite app or open the current production URL.
2. Use `?mode=research`.
3. Log in with dry-run code only: `YW-001` or `YW-002` plus `LKKC-2026-DRYRUN`.
4. Test each viewport listed above.
5. Exercise this path:
   - login;
   - route entry;
   - map reveal;
   - event drawer open/close;
   - stats drawer open/close;
   - journal open/close;
   - enter Beijing;
   - open a hotspot/evidence task;
   - complete one evidence task;
   - open one event;
   - select one decision;
   - complete one checkpoint where available.
6. Record screenshots or notes for any overlap, clipping, scroll trap, or blocked tap.
7. Run code and build checks.
8. Deploy only after local rendered QA is pass or approved conditional pass.
9. Repeat the same critical path on Vercel Production.
10. Then proceed to real-device Task 28.

## Required Checks

Run at minimum:

```bash
npm run check:syntax
npm run check:stability
npm run check:assets
npm run build
npm run check:task28-real-device-qa
npm run check:formal-data-collection-gate
```

If any check fails, do not move to real-device Task 28 until the failure is fixed or explicitly documented as unrelated.

## Result Categories

| Result | Meaning |
|---|---|
| Pass | UI update is stable enough for real iPad / phone / school-Wi-Fi QA. |
| Conditional Pass | Minor non-blocking issues remain, but they have a realistic classroom workaround and are recorded. |
| Fail | Layout, touch, modal, login, or event-flow issues could distort gameplay or research logging. Do not proceed to real-device QA. |

## Current Decision

Current Task 30 decision: `In Progress / Rendered QA Pending`

Reason:

The first mobile/iPad stabilisation override has been applied in `src/style-explore.css`. It protects the phone and tablet layout against horizontal overflow, persistent map-panel coverage, unreachable modal footers, oversized event/evidence modals, and undersized touch controls.

This is not yet a pass. The route-to-map, mobile map, drawer, journal, city, evidence modal, and event modal flows still need rendered multi-viewport QA after the UI update. Real iPad and phone testing should remain deferred until Task 31B passes.

Update on 2026-06-15:

The user confirmed that physical iPad and phone testing will wait until after the UI update. A partial local rendered responsive audit is recorded in `docs/task-31-rendered-responsive-ui-readiness.md`. Task 30 should remain open until the route-to-map, mobile map, drawer, journal, city, evidence modal, and event modal flows are rechecked after the UI update.

Implementation note on 2026-06-15:

- Added `Task 30 · Pilot Mobile/iPad Stabilisation Override` near the end of `src/style-explore.css`.
- The override keeps event and stats panels collapsed/reachable on small screens, limits panel and modal heights with dynamic viewport units, strengthens 44px touch targets, constrains journal and city mission sheet scrolling, and protects evidence/event modal footer reachability.
- No route, city, event, evidence task, research ID, Supabase schema, or content meaning was changed.
- Because the override affects map, drawer, evidence modal, and event modal behaviour, consider `APP_VERSION = lkkc-pilot-v1.1` before formal classroom use if the rendered QA confirms this is the version to deploy.

## Link To Research Gates

- Task 28 real-device QA should run only after Task 30 passes.
- Task 29 formal data collection readiness should remain `No-Go` until Task 30 and Task 28 are complete.
- Task 20.1 sign-off should not be updated to approved until rendered UI, real devices, school Wi-Fi, consent, codes, and export QA are all complete.
