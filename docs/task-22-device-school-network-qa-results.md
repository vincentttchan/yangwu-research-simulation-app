# Task 22 Device / School Network QA Results

Formal research data collection status: not approved until this result sheet is completed and reviewed  
Current decision: pending device and school-network testing

## QA Metadata

- QA Date: 2026-06-14; final school-site QA date TBC
- Operator: Vincent Chan
- Location: Remote/development verification completed; Lok Sin Tong Leung Kau Kui College site QA TBC
- Room: TBC
- Network: Remote network verified; school Wi-Fi / intended classroom network TBC
- Deployment URL: `https://yangwu-research-simulation-app.vercel.app/?mode=research`
- APP_VERSION: `lkkc-pilot-v1.0`
- RESEARCH_COHORT: `lkkc-may-june-2026`
- content_map_version: `content-freeze-lite-v0.1`
- Dry-run participant code(s): `YW-001`, `YW-002`
- Dry-run session code: `LKKC-2026-DRYRUN`

## Device Matrix

| Device | Browser | Network | Viewport / orientation | Login works? | City/evidence/event/decision works? | Journal/modal usable? | Supabase rows verified? | Result | Notes |
|---|---|---|---|---:|---:|---:|---:|---|---|
| Desktop/laptop | Chrome or equivalent | Remote/development network | Desktop viewport | Yes | Partial | TBC | Yes | Partial | Live dry-run login and Supabase row version verification passed. Full manual city/evidence/event/decision/journal pass still TBC for this result sheet. |
| iPad | Safari or Chrome | TBC | iPad portrait and landscape | TBC | TBC | TBC | TBC | TBC | Must test actual or representative iPad before student use. |
| Phone | Safari or Chrome | TBC | Phone portrait; landscape if relevant | TBC | TBC | TBC | TBC | TBC | Must test a common student-sized phone before student use. |
| School Wi-Fi check | Any target browser | School Wi-Fi | Actual classroom condition | TBC | TBC | TBC | TBC | TBC | Must confirm Vercel site and API routes are not blocked by school network. |
| Hotspot fallback, if used | Any target browser | Hotspot | Backup condition | TBC | TBC | TBC | TBC | TBC | Optional fallback check if school Wi-Fi is unstable or blocked. |

Use `Pass`, `Partial`, or `Fail` in the Result column.

## Supabase Row Verification

- Latest `game_sessions` checked: Yes, by researcher after Vercel redeployment on 2026-06-14
- Latest `event_logs` checked: Yes, by researcher after Vercel redeployment on 2026-06-14
- `app_version = lkkc-pilot-v1.0` confirmed: Yes
- `research_cohort = lkkc-may-june-2026` confirmed: Yes
- `content_map_version = content-freeze-lite-v0.1` confirmed: Yes
- Event coverage observed: TBC for full device QA; live dry-run row verification passed
- Multiple sessions created by refresh?: TBC
- Notes: Production `/api/login` returned a valid `YW-001` dry-run session with the frozen pilot markers. Latest Supabase rows were confirmed by the researcher to show `lkkc-pilot-v1.0`.

## Privacy QA

- `research_privacy_exception_export` checked: TBC after final device QA
- Number of rows returned: TBC; expected 0
- Result: TBC
- Notes: Must be checked after iPad/phone/school-network QA and before any real student use.

Expected result: zero data rows.

## Layout / Usability Notes

| Area | Issue observed? | Device | Severity | Action |
|---|---:|---|---|---|
| Research login | TBC | iPad / phone / school network | TBC | Test with `YW-001` or `YW-002` and `LKKC-2026-DRYRUN`. |
| Map labels/seals | TBC | iPad / phone | TBC | Check city labels/seals are visible and usable without excessive zooming or rotation. |
| Event modal height | TBC | iPad / phone | TBC | Check modal content and footer controls fit within viewport. |
| Decision controls | TBC | iPad / phone | TBC | Check decision buttons are reachable and readable. |
| Journal | TBC | iPad / phone | TBC | Open and close journal; check it remains within viewport. |
| Image/audio loading | TBC | School Wi-Fi / target devices | TBC | Confirm slow media does not block core gameplay. |
| Horizontal scrolling / overlap | TBC | iPad / phone | TBC | Check no unwanted horizontal overflow or UI overlap. |

## Network Notes

- School Wi-Fi access: TBC
- Vercel site blocked?: TBC
- Login API blocked?: TBC
- Event log API blocked?: TBC
- Images/audio unusually slow?: TBC
- Hotspot fallback needed?: TBC
- Notes: School-site network check remains a required pre-pilot gate.

## Decision

Select one:

- [ ] Device/network QA passed
- [ ] Device/network QA passed with conditions
- [ ] Device/network QA failed
- [x] Pending

Decision rationale:

Version and Supabase row verification have passed after Vercel redeployment, but the actual device and school-network checks are not yet complete. The project is therefore not yet cleared for real student use.

Required follow-up before student use:

1. Test iPad Safari or Chrome with `YW-001` / `YW-002` and `LKKC-2026-DRYRUN`.
2. Test a student-sized phone with the same dry-run login flow.
3. Test the research URL on school Wi-Fi or the intended classroom network.
4. Verify city/evidence/event/decision/journal flow on each target device.
5. Confirm Supabase `game_sessions` and `event_logs` rows after device QA.
6. Run `research_privacy_exception_export` and confirm zero rows.
7. Update this result sheet and then update Task 20.1 sign-off.
