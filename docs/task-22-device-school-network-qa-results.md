# Task 22 Device / School Network QA Results

Formal research data collection status: not approved until this result sheet is completed and reviewed  
Current decision: home/individual network testing accepted; iPad and phone QA temporarily deferred, not waived

## QA Metadata

- QA Date: 2026-06-14 to 2026-06-15; final in-scope network QA date TBC
- Operator: Vincent Chan
- Location: Remote/development verification completed; home/individual tester location accepted for the current plan
- Room: N/A for home/individual tester completion unless a classroom session is later added
- Network: Remote network verified; school Wi-Fi is no longer required for the current plan
- Scope note: As of 2026-06-16, iPad and phone testing is intentionally paused. School Wi-Fi / classroom network testing is also no longer treated as a required gate because testers may complete the activity at home. This supports continuing laptop/desktop readiness work, but it does not clear tablet/phone use for formal student data collection.
- Deployment URL: `https://yangwu-research-simulation-app.vercel.app/?mode=research`
- APP_VERSION: `lkkc-pilot-v1.0`
- RESEARCH_COHORT: `lkkc-may-june-2026`
- content_map_version: `content-freeze-lite-v0.1`
- Dry-run participant code(s): `YW-001`, `YW-002`
- Dry-run session code: `LKKC-2026-DRYRUN`

## Device Matrix

| Device | Browser | Network | Viewport / orientation | Login works? | City/evidence/event/decision works? | Journal/modal usable? | Supabase rows verified? | Result | Notes |
|---|---|---|---|---:|---:|---:|---:|---|---|
| Desktop/laptop | Chrome automation | Remote network | 1280 x 800 desktop viewport | Yes | Yes for login/map/Beijing/source/evidence/event/decision/checkpoint data path | Partial | Yes | Pass for remote desktop data-path QA | Task 27 confirmed production front-end events visible in Supabase export views. Journal/modal manual usability still TBC for actual devices. |
| Assistant remote baseline | Browser + direct API | Remote production network, not school Wi-Fi | 1280 x 720 desktop baseline | Yes | Not a full gameplay pass | TBC | Login API session verified | Pass for remote baseline only | Task 28 assisted baseline confirmed research URL, login modal, and `/api/login` with full pilot markers. This does not replace real iPad/phone/school Wi-Fi QA. |
| Laptop current-network production baseline | Headless Chrome automation | Current Mac network; not verified as school Wi-Fi | 1280 x 800 desktop viewport | Yes | Yes for Li route, map phase 6, Beijing event, Beijing city, bj-wall evidence, linked event/decision | Yes for event/evidence modal footer reachability | API accepted login/log batches | Pass for current-network laptop baseline only | 2026-06-15 run used `YW-002`; `/api/login` returned `200`; `/api/logs-batch` returned `200` three times. Mac reported not associated with an AirPort network, so this is not a school Wi-Fi pass. |
| Normal-flow UI follow-up | Headless Chrome automation | Local Vite, not school Wi-Fi | Phone and iPad proxy viewports | Local dev bypass only | Follow-up needed | Follow-up needed | No production rows expected | Open | A later normal-flow QA run found an iPad landscape historical-event issue. Do not treat this item as passed until the issue is retested after UI changes. |
| iPad | Safari or Chrome | Deferred | iPad portrait and landscape | Deferred | Deferred | Deferred | Deferred | Deferred | Temporarily paused by researcher on 2026-06-16. Must test actual or representative iPad before any formal iPad use. |
| Phone | Safari or Chrome | Deferred | Phone portrait; landscape if relevant | Deferred | Deferred | Deferred | Deferred | Deferred | Temporarily paused by researcher on 2026-06-16. Must test a common student-sized phone before any formal phone use. |
| School Wi-Fi check | Any target browser | School Wi-Fi | Actual classroom condition | N/A | N/A | N/A | N/A | N/A | No longer required for the current plan because testers may complete the activity at home. Reopen only if a classroom/school-network session is added. |
| Home/individual network check | Any target browser | Home or individual tester network | Actual tester condition | TBC | TBC | TBC | TBC | TBC | Required in-scope network check for current plan. Confirm Vercel site, API routes, and media work for tester completion. |
| Hotspot fallback, if used | Any target browser | Hotspot | Backup condition | TBC | TBC | TBC | TBC | TBC | Optional fallback check if a tester network is unstable or blocked. |

Use `Pass`, `Partial`, or `Fail` in the Result column.

## Supabase Row Verification

- Latest `game_sessions` checked: Yes, by researcher after Vercel redeployment and Task 27 dry-run
- Latest `event_logs` checked: Yes, through `research_event_log_long_export` after Task 27 dry-run
- `app_version = lkkc-pilot-v1.0` confirmed: Yes
- `research_cohort = lkkc-may-june-2026` confirmed: Yes
- `content_map_version = content-freeze-lite-v0.1` confirmed: Yes
- Device fields populated: Yes for remote desktop sessions; tablet and phone device fields TBC
- Event coverage observed: `source_opened`, `evidence_task_completed`, `decision_selected`, and `checkpoint_submitted`
- Multiple sessions created by refresh?: TBC for real device QA; Task 27 intentionally created separate dry-run sessions for separate event paths
- Notes: Task 27 confirmed two dry-run sessions for source/evidence/event and checkpoint coverage. Supabase export query returned the expected relevant rows. Task 28 assisted remote baseline also created a login API session with the expected version markers. On 2026-06-15, a current-network production laptop baseline completed the latest public dry-run path and received successful API responses; direct Supabase row inspection still needs to be repeated after final in-scope device/network QA.

## Privacy QA

- `research_privacy_exception_export` checked: Yes during Task 27; must be repeated after final device QA
- Number of rows returned: `0`
- Result: Pass for Task 27 remote dry-run
- Notes: Repeat after final in-scope network/device QA and before any real student use.

Expected result: zero data rows.

## Layout / Usability Notes

| Area | Issue observed? | Device | Severity | Action |
|---|---:|---|---|---|
| Research login | TBC | in-scope network/device | TBC | Test with `YW-001` or `YW-002` and `LKKC-2026-DRYRUN`. |
| Map labels/seals | TBC | iPad / phone | TBC | Check city labels/seals are visible and usable without excessive zooming or rotation. |
| Event modal height | TBC | iPad / phone | TBC | Check modal content and footer controls fit within viewport. |
| Decision controls | TBC | iPad / phone | TBC | Check decision buttons are reachable and readable. |
| Journal | TBC | iPad / phone | TBC | Open and close journal; check it remains within viewport. |
| Image/audio loading | TBC | Home/individual tester network / target devices | TBC | Confirm slow media does not block core gameplay. |
| Horizontal scrolling / overlap | TBC | iPad / phone | TBC | Check no unwanted horizontal overflow or UI overlap. |
| Coachmark overlay | Yes in headless desktop automation | Remote desktop automation | Low for data path; TBC for real devices | Task 27 observed the coachmark layer intercepting some automated clicks even when `aria-hidden`. Recheck manually on iPad and phone. |
| Opening/tutorial overlays | Needs check | iPad / phone | TBC | Task 28 assisted baseline confirmed login dismissal, but real-device touch behavior still needs manual checking after login. |

## Task 28 Live Field Sheet

Use this section when testing the real iPad, phone, school network if later needed, and home/individual tester network. Enter `Pass`, `Partial`, `Fail`, `Deferred`, or `N/A`.

| Device / network | Code | Browser | Orientation | Login | Li route to map | Beijing event | Beijing city | Evidence modal | Journal/drawers | Supabase rows | Privacy rows | Result | Notes / screenshot reference |
|---|---|---|---|---|---|---|---|---|---|---|---:|---|---|
| Laptop/desktop on home or individual tester network | `YW-001` | TBC | TBC | TBC | TBC | TBC | TBC | TBC | TBC | TBC | TBC | TBC | Required in-scope network check for the current plan. |
| Laptop on school Wi-Fi | `YW-001` | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Not required unless a classroom/school-network session is added. |
| iPad on school Wi-Fi | `YW-001` | Deferred | Portrait | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Paused on 2026-06-16; reopen before any iPad student use. |
| iPad on school Wi-Fi | `YW-001` | Deferred | Landscape | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Paused on 2026-06-16; reopen before any iPad student use. |
| Phone on school Wi-Fi | `YW-002` | Deferred | Portrait | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Deferred | Paused on 2026-06-16; reopen before any phone student use. |
| Hotspot fallback, if used | `YW-002` | TBC | TBC | TBC | TBC | TBC | TBC | TBC | TBC | TBC | TBC | TBC |  |

Minimum expected live flow:

1. Research login appears at `?mode=research`.
2. `YW-001` or `YW-002` + `LKKC-2026-DRYRUN` logs in.
3. Li Hongzhang route reaches map phase 6.
4. First normal target city is Beijing.
5. Event drawer / stats drawer or iPad stats panel / journal are usable.
6. Beijing opens and the first historical event action/footer is reachable.
7. One Beijing evidence task opens and fits the viewport.
8. Supabase shows the latest `game_sessions` and relevant `event_logs`.
9. `research_privacy_exception_export` returns zero rows.

## Network Notes

- School Wi-Fi access: N/A for the current plan
- Home/individual tester network accepted?: Yes
- Vercel site blocked?: TBC on final in-scope network check
- Login API blocked?: TBC on final in-scope network check
- Event log API blocked?: TBC on final in-scope network check
- Images/audio unusually slow?: TBC on final in-scope network check
- Hotspot fallback needed?: TBC
- Notes: School-site network check is no longer a required pre-pilot gate unless a classroom/school-network session is later added.

## Decision

Select one:

- [ ] Device/network QA passed
- [ ] Device/network QA passed with conditions
- [ ] Device/network QA failed
- [x] Pending

Decision rationale:

Version, production data-path, Supabase export visibility, and assistant-assisted remote production baseline have passed. The actual iPad and phone checks are temporarily deferred, and school Wi-Fi is no longer a required gate because testers may complete the activity at home. The project is still not yet cleared for real student use until the remaining in-scope network/device dry-run, private operational readiness, final export QA, and final sign-off are complete.

Required follow-up before student use:

1. Use Task 28 (`docs/task-28-real-device-school-wifi-qa-checklist.md`) as the field execution checklist.
2. Test the research URL on the actual in-scope tester network with laptop/desktop first; home/individual network is acceptable.
3. If the formal first run will include iPad or phone use, reopen the deferred iPad/phone QA and test with `YW-001` / `YW-002` and `LKKC-2026-DRYRUN`.
4. Verify city/evidence/event/decision/checkpoint/journal flow on each in-scope target device.
5. Confirm Supabase `game_sessions` and `event_logs` rows after device/network QA.
6. Run `research_privacy_exception_export` and confirm zero rows.
7. Update this result sheet and then update Task 20.1 sign-off.
