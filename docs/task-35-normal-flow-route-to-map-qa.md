# Task 35 Mobile / iPad UI Update + Normal-Flow Route-to-Map QA

Status: Task 62 follow-up pass  
Formal research data collection status: still `No-Go`

## Purpose

Task 35 converts the remaining Task 31B handoff into a normal player flow QA pass.

The earlier Task 34 pass confirmed that the new visual assets can load. It did not fully prove that a student can move from research entry to route selection, map, city, event modal, and evidence task through the same sequence of controls used in play. Task 35 therefore avoids debug state forcing and checks the normal player path.

## Scope

Local QA URL:

- `http://127.0.0.1:5174/?mode=research`

QA mode:

- local development / dry-run only;
- no real student name, student ID, email, phone number, or school account is entered;
- research login uses the local `開發試玩` bypass.

Required viewports:

| Viewport | Role |
|---|---|
| `390 x 844` | Phone stress test |
| `430 x 932` | Large phone |
| `768 x 1024` | iPad portrait proxy |
| `1024 x 768` | iPad landscape proxy |

## Normal Player Flow

The automated QA uses the following normal player flow:

1. Open the research URL.
2. Use local development entry only.
3. Wait for the opening screen.
4. Press `入局啟程`.
5. Confirm the character-selection screen is visible.
6. Select the active Li Hongzhang route.
7. Confirm the route selection, then press the route CTA again to embark.
8. Press through the route cutscene until the map handoff.
9. Wait until `screen3[data-phase="6"]`.
10. Skip the first-time map coachmark through the visible UI.
11. Confirm the map is visible and usable.
12. Confirm the first normal target city is Beijing.
13. Open and close the event drawer.
14. Open and close the stats drawer.
15. Open and close the journal.
16. Enter Beijing through the normal city target.
17. Confirm the Beijing city scene is ready.
18. Open one hotspot and one evidence task modal.
19. Confirm the evidence task modal fits the viewport and the submit control is reachable.
20. Complete the evidence task through normal student controls.
21. Confirm the first historical event modal opens after the evidence-gated city action is unlocked.
22. Confirm the historical event modal action/footer is reachable.
23. Close the event through a normal choice and continue action.

Task 62 clarification: the current game intentionally protects the first city entry so that students encounter the city/evidence loop before a pinned historical event interrupts the scene. Therefore the valid normal flow is `city -> evidence -> unlocked city action event`, not `city -> immediate event`.

## Automated Evidence

Generated QA folder:

- `docs/qa-artifacts/task35-normal-flow/`

Generated summary:

- `docs/qa-artifacts/task35-normal-flow/task35-normal-flow-summary.json`

Representative screenshot set per viewport:

- `login`
- `character`
- `map`
- `events-open`
- `stats-open`
- `journal`
- `city`
- `evidence`
- `event-open`
- `event-payoff`

## Results To Verify

| Check | Expected result |
|---|---|
| Route-to-map | Reaches `screen3[data-phase="6"]` in all four viewports. |
| Phone default event drawer | Collapsed by default at `390 x 844` and `430 x 932`. |
| Phone default stats drawer | Closed by default at `390 x 844` and `430 x 932`. |
| Drawers | Event drawer and stats drawer can open and close. |
| Journal | Journal opens and closes without trapping the player. |
| Map layout | No horizontal overflow. |
| First target city | Beijing is correctly highlighted as the first normal historical target. |
| Evidence task | The first evidence task can be completed through normal controls. |
| Event modal | The first historical event modal opens after evidence-gated city actions unlock, and its action/footer is reachable. |
| City scene | Beijing city scene reaches `ready`. |
| Evidence modal | Evidence task modal fits the viewport and the submit control is visible. |
| Images | Map/city/evidence images load without visible broken images. |
| Console | No relevant runtime warnings or errors. |

## Automated Results

Fresh Task 62 follow-up automated run completed on 2026-06-19.

| Viewport | Route-to-map | Map overflow | Default map UI | City | Evidence task | Event modal |
|---|---|---:|---|---|---|---|
| `390 x 844` | Pass | `0` | Events collapsed; stats closed | Beijing ready | Fits viewport; submit visible; solvable | Footer/action reachable after evidence unlock |
| `430 x 932` | Pass | `0` | Events collapsed; stats closed | Beijing ready | Fits viewport; submit visible; solvable | Footer/action reachable after evidence unlock |
| `768 x 1024` | Pass | `0` | Events collapsed; stats closed | Beijing ready | Fits viewport; submit visible; solvable | Footer/action reachable after evidence unlock |
| `1024 x 768` | Pass | `0` | Events collapsed; stats closed | Beijing ready | Fits viewport; submit visible; solvable | Footer/action reachable after evidence unlock |

Additional automated checks:

- `12` city seals rendered in each viewport.
- First normal target city was `beijing` in each viewport.
- Beijing city image loaded at `1600 x 900`.
- Beijing wall evidence image loaded at `1600 x 900`.
- Visible broken images: `0`.
- Relevant console warnings/errors: `0`.

## Current Decision

Current Task 62 follow-up decision for the Task 35 automated normal-flow gate: `Pass`.

Rationale:

- A local automated pass can validate the normal player route-to-map path across phone and iPad-sized viewports.
- The test now follows the current intended first-city learning loop: evidence first, then unlocked historical event.
- This clears the desktop-assisted mobile/iPad UI gate for the current implementation.
- It still does not replace real iPad / phone QA, because real devices may expose Safari viewport, touch, and performance issues that headless local Chrome cannot fully represent.

## Remaining No-Go Conditions

Formal research data collection remains `No-Go` until:

- real iPad and phone QA is completed after this UI update;
- teacher/classroom pilot runbook sign-off is reviewed against the actual lesson flow;
- participant/session code operational setup is checked immediately before the classroom pilot;
- Supabase live row capture and CSV export are checked with the final pilot app version.

## Next Step

After Task 35 passes, proceed to Task 28 real-device QA with the same player path:

1. research entry;
2. Li Hongzhang route;
3. map phase 6;
4. Beijing city scene;
5. evidence task modal;
6. evidence-gated Beijing historical event;
7. one short event/log export sanity check.
