# Task 31B Route-to-Map / Mobile Map QA Handoff

Status: mobile stabilisation implemented; rendered route-to-map QA not yet passed  
Formal research data collection status: not approved  
Relationship to Task 31: continues the pending mobile map checks from Task 31  
Relationship to Task 28: must be completed before real iPad / phone / school Wi-Fi QA

## Purpose

Task 31B turns the unfinished part of Task 31 into a precise handoff checklist for the next UI QA pass.

Task 31 verified local entry and character-selection responsiveness. It did not conclusively verify the mobile route-to-map transition and map-level panels because the in-app browser tab became unavailable during the transition. This handoff preserves the exact next checks so that the next UI update can be tested without ambiguity.

## Current Decision

Current Task 31B decision: `Pending / Needs Rendered QA`

Reason:

- Local static gates and build have passed in Task 31.
- Mobile character selection at `390 x 844` was verified as usable.
- A focused mobile/iPad CSS stabilisation override has now been added for map panels, journal, city mission sheet, evidence task modal, event modal, and touch targets.
- The route-to-map and map drawer flow still needs stable rendered verification.
- Browser plugin was attempted first, as required, but the in-app browser webview lost or failed to attach to its tab during the route-to-map test.
- Chrome fallback has not been used in this pass because it should be separately approved.

## Browser Evidence From This Pass

| Step | Result | Notes |
|---|---|---|
| Load local `?mode=research` page at `390 x 844` | Pass | Page title and meaningful content loaded; no console errors at initial load. |
| Research dialog appears | Pass | `?mode=research` showed the research registration dialog. |
| Use dry development entry | Incomplete | Browser tab was lost after attempting the development-play path. |
| Reopen non-research local route | Blocked by tool | Browser webview timed out while attaching to the new tab. |
| Route-to-map rendered QA | Not completed | Needs rerun with stable Browser, approved Chrome fallback, or real device. |

## Additional Smoke Evidence After Task 30 Override

After the mobile/iPad stabilisation override was added, a local Browser smoke pass at `390 x 844` reached the route-to-map transition and confirmed:

- the app loaded in local development mode without a framework error overlay;
- entry to character selection succeeded;
- the visible active route CTA was usable;
- the route cutscene reached `screen3[data-phase="6"]`;
- document width and scroll width both remained `390`, so no top-level horizontal overflow was observed;
- no console error or warning entries were reported during this smoke pass.

This evidence is helpful but not enough to pass Task 31B, because event drawer, stats drawer, journal, city, evidence task modal, and event modal interaction proof still needs a stable rendered pass.

## Flow To Test Next

Use this exact flow after the UI update is complete:

1. Open `http://127.0.0.1:5173/?mode=research`.
2. Use development/dry-run entry only; do not enter real student data.
3. Clear the opening historical cutscene by pressing `繼續` until it disappears.
4. Press `入局啟程`.
5. Confirm the character-selection screen is visible at `390 x 844`.
6. Confirm the active Li Hongzhang CTA is visible and tappable.
7. Click the active CTA once to select / seal the route.
8. Click the chosen CTA a second time to start the route cutscene.
9. Press through the route cutscene until `啟程`.
10. Wait until map `data-phase="6"` appears.
11. Confirm the map is visible and usable.
12. Open and close the event drawer.
13. Open and close the stats / resistance drawer.
14. Open and close the journal.
15. Enter Beijing or the current starting city.
16. Confirm one city scene opens.
17. Open one evidence hotspot.
18. Confirm the evidence task modal fits the phone viewport.
19. Open one historical event modal where available.
20. Confirm the event modal footer / continue controls remain reachable.

## Required Viewports

Minimum rerun viewports:

| Viewport | Required result |
|---|---|
| `390 x 844` | Phone stress test: no horizontal overflow; route-to-map reaches phase 6; drawers and modals usable. |
| `430 x 932` | Large phone: same as above, with better breathing room. |
| `768 x 1024` | iPad portrait: map and panels readable without rotation. |
| `1024 x 768` | iPad landscape: central map remains readable and panels do not dominate. |

## Pass Criteria

Task 31B can pass only when all of the following are directly observed:

- route-to-map reaches `screen3[data-phase="6"]`;
- document has no horizontal overflow at `390 x 844`;
- event drawer is collapsed by default on phone and can be opened / closed;
- stats drawer is collapsed by default on phone and can be opened / closed;
- journal opens and closes without trapping the player;
- at least one city can be entered;
- at least one evidence task modal is readable on phone portrait;
- at least one event modal has usable scroll / footer reachability;
- console has no relevant runtime errors;
- no real names, student IDs, emails, phone numbers, or school account identifiers are entered or displayed.

## Current Recommendation

Do not proceed to real iPad / phone Task 28 yet.

Next practical options:

1. Rerun Task 31B in the in-app browser if stable, using the new mobile/iPad stabilisation override.
2. If the in-app browser remains unstable, explicitly approve Chrome fallback for local UI QA.
3. If Chrome fallback is not desired, run Task 31B directly on the real iPad / phone after the UI update and record it as part of Task 28.

## Version Note

If the UI update changes route-to-map behaviour, mobile map layout, drawer behaviour, evidence modal layout, or event modal layout, consider bumping the pilot marker from `lkkc-pilot-v1.0` to `lkkc-pilot-v1.1` before formal classroom use.
