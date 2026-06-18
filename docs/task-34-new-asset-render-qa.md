# Task 34 New Asset Render QA / Route-to-Map Visual QA

Status: conditional pass for new asset loading; route-to-map visual proof still requires manual real-device confirmation

Formal research data collection status: still `No-Go`

## Purpose

Task 34 checks whether the newly compressed or replaced visual assets can be loaded and rendered in the actual game surfaces before real iPad, phone, and school Wi-Fi QA.

This task is a visual and technical QA gate. It does not approve formal student data collection and does not replace Task 28 real-device testing.

## Scope

Local test URL:

- `http://localhost:5174/`

Tested viewport set:

- desktop: `1280 x 720`
- iPad landscape proxy: `1024 x 768`
- phone portrait proxy: `390 x 844`

Tested surfaces:

- map: `assets/map/east-asia-historical.webp`
- city scene: `assets/city/city-beijing.webp`
- evidence task banner: `assets/hotspot/bj-wall.webp`
- event modal image: `assets/events/e_yuanmingyuan.webp`

## Automated Render Evidence

Generated QA folder:

- `docs/qa-artifacts/task34-final/`

Generated summary:

- `docs/qa-artifacts/task34-final/task34-final-render-qa-summary.json`

Representative screenshots:

- `docs/qa-artifacts/task34-final/desktop-1280x720-map.png`
- `docs/qa-artifacts/task34-final/desktop-1280x720-beijing-city.png`
- `docs/qa-artifacts/task34-final/desktop-1280x720-bj-wall-evidence.png`
- `docs/qa-artifacts/task34-final/desktop-1280x720-yuanmingyuan-event.png`
- `docs/qa-artifacts/task34-final/ipad-1024x768-map.png`
- `docs/qa-artifacts/task34-final/ipad-1024x768-beijing-city.png`
- `docs/qa-artifacts/task34-final/ipad-1024x768-bj-wall-evidence.png`
- `docs/qa-artifacts/task34-final/ipad-1024x768-yuanmingyuan-event.png`
- `docs/qa-artifacts/task34-final/phone-390x844-map.png`
- `docs/qa-artifacts/task34-final/phone-390x844-beijing-city.png`
- `docs/qa-artifacts/task34-final/phone-390x844-bj-wall-evidence.png`
- `docs/qa-artifacts/task34-final/phone-390x844-yuanmingyuan-event.png`

## Results

| Check | Result | Notes |
|---|---|---|
| Asset reference check | Pass | `npm run check:assets` passed before Task 34. |
| Local production build | Pass | `npm run build` passed before Task 34. |
| Map image load | Pass | `east-asia-historical.webp` reports natural size `1586 x 992`. |
| Beijing city image load | Pass | `city-beijing.webp` reports natural size `1600 x 900`. |
| Beijing wall evidence image load | Pass | `bj-wall.webp` reports natural size `1600 x 900`. |
| Yuanmingyuan event image load | Pass | `e_yuanmingyuan.webp` reports natural size `1600 x 900`. |
| Visible broken images | Pass | Summary reports `0` visible broken images across the tested states. |
| Horizontal overflow | Pass | Summary reports `overflowX = 0` across the tested states. |
| Phone evidence modal | Pass | Phone screenshot shows evidence task content and banner image fitting within the viewport. |
| Phone event modal | Pass | Phone screenshot shows Yuanmingyuan event image and choices fitting within the viewport. |
| Stable map visual proof | Partial | Automated map screenshots were affected by route/year/part-transition layers during forced QA. DOM state confirms map image load and city seals, but manual route-to-map visual confirmation is still required. |
| Stable city visual proof | Partial | Automated city screenshots were affected by narrative transition layers on some viewport runs. DOM state confirms city image load and hotspot count, but manual city-scene visual confirmation is still required. |

## Important QA Observation

When the automated test forced the Li Hongzhang route into Beijing, the game sometimes triggered year or part-transition layers such as `1875` or `1895`. This is not an image-compression failure. It is a flow-layer issue caused by driving the game state directly through debug controls rather than through a normal player path.

For formal readiness, map and city visual QA should be repeated through the normal route-to-map flow after the next UI update, especially on:

- real iPad Safari or Chrome;
- real phone Safari or Chrome;
- school Wi-Fi or the intended classroom network.

## Decision

Current Task 34 decision: `Conditional Pass`

Rationale:

- The updated assets are valid, load correctly, and do not create visible broken images in the tested surfaces.
- Evidence and event modal images render clearly on phone-sized viewport.
- Automated map and city screenshots are not sufficient as final real-device visual proof because route/year transition layers can cover the target surface during forced QA.

Task 34 clears the asset-loading concern. It does not clear Task 28 real-device QA, Task 29 formal data collection readiness, or Task 32 formal pilot launch.

## Next Step

After the next UI update, complete a normal-flow rendered QA pass:

1. enter `?mode=research`;
2. log in with dry-run codes;
3. choose Li Hongzhang route;
4. reach the map without debug shortcuts;
5. enter Beijing or Shanghai;
6. open one evidence task and one event modal;
7. confirm screenshots on desktop, iPad, and phone;
8. then proceed to Task 28 real iPad, phone, and school-Wi-Fi QA.
