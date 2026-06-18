# Task 28 Real Device / Network QA Execution Checklist

Status: execution checklist updated after Task 35; iPad/phone QA deferred and school Wi-Fi no longer required for the current home/individual tester plan  
Formal research data collection status: not approved until Task 28 is completed, recorded, and reviewed

Note: Task 35 has now provided a local normal-flow mobile/iPad QA pass for the latest UI. Task 28 should use the same player path on the actual in-scope devices and networks. As of 2026-06-16, iPad and phone testing is deferred, and school Wi-Fi is not required because testers may complete the activity at home. If the UI is changed again before real-device testing, repeat the relevant local responsive gate before treating Task 28 results as final.

Task 30 must be reviewed before real iPad / phone / school Wi-Fi QA is treated as ready, even when school Wi-Fi is replaced by a home or individual tester network.

## Purpose

Task 28 is the execution checklist for testing the Yangwu research simulation on real devices and the intended network condition before any student pilot or formal data-collection run.

This is a dry-run technical and classroom-readiness rehearsal only. It is not formal research data collection and it must not use real student names, student IDs, school account identifiers, emails, phone numbers, or the name-to-code matching list.

The purpose is to confirm:

- the research URL works on the actual devices students are likely to use;
- the intended network condition can reach the Vercel app and the research API routes;
- the login, map, evidence, event, decision, checkpoint, and journal flows are usable on the in-scope device scope;
- Supabase receives the expected `game_sessions` and `event_logs` rows with the correct pilot markers;
- no privacy exception rows are created.

## Pilot Markers

| Marker | Value |
|---|---|
| Research URL | `https://yangwu-research-simulation-app.vercel.app/?mode=research` |
| Supabase project | `yangwu-research-lkkc-2026` |
| APP_VERSION | `lkkc-pilot-v1.0` |
| RESEARCH_COHORT | `lkkc-may-june-2026` |
| content_map_version | `content-freeze-lite-v0.1` |
| Dry-run participant codes | `YW-001`, `YW-002` |
| Optional wrong-code test | `YW-999` |
| Dry-run session code | `LKKC-2026-DRYRUN` |

## Roles

| Role | Main responsibility |
|---|---|
| Researcher/operator | Runs the checklist, enters dry-run codes, records results, verifies Supabase rows. |
| Teacher/support person, if available | Confirms classroom device/network reality and notes practical student-support issues. |
| Technical fallback person, if available | Helps switch network, device, or browser if the primary setup fails. |

Only the researcher/operator should access Supabase. Students should not see Supabase, Vercel settings, secret keys, SQL queries, or any research code list.

## Materials To Prepare

- [ ] One laptop or desktop browser for baseline control testing.
- [ ] One iPad or representative classroom tablet, only if iPad is included in the current formal device scope.
- [ ] One student-sized phone, only if phone is included in the current formal device scope.
- [ ] Chargers or enough battery for all devices.
- [ ] Home/individual tester network or the actual network used for the activity.
- [ ] Mobile hotspot fallback, only if the primary network is unstable.
- [ ] The research URL in typed form and QR-code form.
- [ ] Dry-run codes: `YW-001`, `YW-002`, `LKKC-2026-DRYRUN`.
- [ ] Task 22 results sheet: `docs/task-22-device-school-network-qa-results.md`.
- [ ] Supabase SQL Editor access for the researcher only.
- [ ] A simple paper note sheet for timestamps, device names, and observed issues.

Do not bring or use the real name-to-code matching list for this QA unless it is absolutely required for a separate administrative check. It should not be entered into the app, Supabase, or result files.

## Before Going On Site

- [ ] Confirm Task 30 UI stabilisation gate has passed or is explicitly approved as conditional pass.
- [ ] Confirm Task 35 normal-flow route-to-map QA has passed for `390 x 844`, `430 x 932`, `768 x 1024`, and `1024 x 768`.
- [ ] Confirm the latest Vercel Production deployment is `Ready`.
- [ ] Open the research URL on a non-school network.
- [ ] Confirm `?mode=research` shows the research login.
- [ ] Confirm the default URL without `?mode=research` does not force the research login.
- [ ] Confirm `YW-001` + `LKKC-2026-DRYRUN` logs in.
- [ ] Confirm `YW-999` or a wrong session code is rejected, if time permits.
- [ ] Confirm the production app records `lkkc-pilot-v1.0`, `lkkc-may-june-2026`, and `content-freeze-lite-v0.1`.
- [ ] Confirm Supabase can show recent `game_sessions`.
- [ ] Confirm `research_privacy_exception_export` currently returns zero rows.
- [ ] Prepare hotspot fallback in case the intended network blocks Vercel or API routes.

## Execution Order

Use this order so that each failure can be isolated cleanly:

1. Laptop or desktop baseline on the actual in-scope network; home/individual tester network is acceptable.
2. iPad on the actual in-scope network, only if iPad is included.
3. Phone on the actual in-scope network, only if phone is included.
4. Hotspot fallback, only if the primary network fails or is too slow.
5. Supabase verification after each device, or at minimum after each network condition.

If the laptop baseline fails on the primary network but works on hotspot, treat the primary network as the likely issue and record it before testing more devices.

## Per-Device Timed Script

Record start and end time for each device.

| Step | Action | Expected result | Result |
|---:|---|---|---|
| 1 | Open `https://yangwu-research-simulation-app.vercel.app/?mode=research` | Research login appears. | TBC |
| 2 | Enter wrong code `YW-999`, if time permits | Login is rejected clearly. | TBC |
| 3 | Log in with `YW-001` or `YW-002` and `LKKC-2026-DRYRUN` | Session starts without personal-data fields. | TBC |
| 4 | Select the Li Hongzhang route | Route intro starts and can continue. | TBC |
| 5 | Reach the map | Map is visible and usable. | TBC |
| 6 | Confirm the first normal target is Beijing | Beijing is clearly indicated as the first historical target. | TBC |
| 7 | Open and close the event drawer | Drawer is usable; phone default is collapsed. | TBC |
| 8 | Open and close the stats / resistance drawer or inspect the iPad stats panel | Phone drawer opens/closes; iPad panel is readable. | TBC |
| 9 | Open and close journal | Journal is readable and dismissible. | TBC |
| 10 | Enter Beijing | City scene opens. | TBC |
| 11 | Confirm the first historical event modal | Event modal fits the viewport and action/footer is reachable. | TBC |
| 12 | Select one decision | Decision is accepted and the flow continues. | TBC |
| 13 | Open `bj-wall` or another Beijing evidence hotspot | Source/evidence task opens. | TBC |
| 14 | Complete one evidence task, if time permits | Evidence submission works. | TBC |
| 15 | Open `bj-junji` or another facility checkpoint, if available | Checkpoint opens. | TBC |
| 16 | Submit one checkpoint response, if available | Checkpoint submission works. | TBC |
| 17 | Refresh once | Student can continue or restart without a confusing dead end. | TBC |
| 18 | Leave the app idle for one minute, if time permits | No unexpected logout or frozen overlay. | TBC |

The early journal check verifies map-level navigation before city entry. If time permits, repeat the journal check after event/evidence activity to verify recovery.

If a step cannot be completed, record the exact step, device, browser, network, and any visible error. Do not keep retrying indefinitely; switch to the fallback rule below.

## iPad And Phone Usability Checks

### Login

- [ ] Input boxes are easy to tap.
- [ ] The on-screen keyboard does not hide the submit button.
- [ ] Wrong-code feedback is readable.
- [ ] No real-name or contact field appears.

### Map

- [ ] No large blank area appears.
- [ ] No unwanted horizontal scrolling appears.
- [ ] City labels and seals are readable enough for selection.
- [ ] City seals are tappable without precise mouse-like control.
- [ ] The player does not need to rotate the device to continue.
- [ ] Mobile drawer, route information, or journal buttons do not block city selection.

### Evidence / Event / Decision

- [ ] Evidence cards or statements fit inside the screen.
- [ ] Drag, tap, or selection controls work with touch.
- [ ] Event modal height is usable on phone portrait and iPad.
- [ ] Modal footer buttons remain reachable.
- [ ] Decision choice text does not clip.
- [ ] Return-to-map flow is clear.

### Journal / Overlay / Recovery

- [ ] Journal opens within the viewport.
- [ ] Journal closes without trapping the player.
- [ ] Coachmark or tutorial overlay does not block normal taps.
- [ ] Refresh does not create a privacy or data-integrity issue.
- [ ] Accidental back navigation has an understandable recovery path.

## Network Checks

Record each network condition separately.

| Check | Home/individual or primary network result | Hotspot result, if used | Notes |
|---|---|---|---|
| Vercel page loads | TBC | TBC |  |
| Login API works | TBC | TBC |  |
| Event log API works | TBC | TBC |  |
| Images load quickly enough | TBC | TBC |  |
| Audio does not block gameplay | TBC | TBC |  |
| Supabase rows appear | TBC | TBC |  |
| No captive portal interruption | TBC | TBC |  |
| No VPN or special account required | TBC | TBC |  |

If the primary network blocks only media but the core game and event logging work, mark the result as `Partial` and decide whether lower-media fallback is acceptable for the activity. If login or event logging is blocked, mark the result as `Fail` unless a reliable hotspot plan is approved.

## Supabase Verification

Run this after each tested device if possible:

```sql
select
  participant_code,
  session_id::text,
  device_category,
  viewport_width,
  viewport_height,
  browser_family,
  app_version,
  research_cohort,
  content_map_version,
  started_at
from game_sessions
where participant_code in ('YW-001', 'YW-002')
order by started_at desc
limit 20;
```

Then verify event coverage:

```sql
select
  participant_code,
  session_id::text,
  event_type,
  route_id,
  city_id,
  event_id,
  source,
  task_type,
  checkpoint_type,
  checkpoint_correct,
  app_version,
  research_cohort,
  content_map_version,
  server_time::text
from research_event_log_long_export
where participant_code in ('YW-001', 'YW-002')
  and event_type in (
    'source_opened',
    'evidence_task_completed',
    'decision_selected',
    'checkpoint_submitted'
  )
order by server_time desc
limit 50;
```

Expected result:

- latest rows use `YW-001` or `YW-002` only;
- no real student name, student ID, email, phone, or school account appears;
- `app_version = 'lkkc-pilot-v1.0'`;
- `research_cohort = 'lkkc-may-june-2026'`;
- `content_map_version = 'content-freeze-lite-v0.1'`;
- device fields are populated enough to distinguish desktop, tablet, and phone;
- the event export shows at least `source_opened`, `evidence_task_completed`, `decision_selected`, and `checkpoint_submitted` across the completed dry-run devices.

Run the privacy check:

```sql
select *
from research_privacy_exception_export
limit 20;
```

Expected result: zero rows.

## Pass / Partial / Fail Rules

| Result | Meaning |
|---|---|
| Pass | Device and network can open the research URL, log in, complete the core gameplay script, and create visible Supabase rows without serious usability or privacy issues. |
| Partial | The flow completes, but there are notable layout, speed, media, device, or teacher-support issues with a realistic classroom workaround. |
| Fail | The device or network cannot log in, cannot complete the core flow, cannot create Supabase rows, or creates a privacy/data-integrity risk. |

## Stop Rules

Stop before any real student pilot if any of the following occurs:

- research login cannot be completed on the primary classroom device;
- the intended network blocks the site, login API, or event log API and no reliable fallback is available;
- iPad or phone layout prevents core gameplay;
- event rows do not appear after refresh, waiting, and one controlled retry;
- `research_privacy_exception_export` returns any row;
- real names, student IDs, contact details, or name-to-code data appear in app payloads or exports;
- the operator cannot confidently distinguish dry-run data from future formal data.

## Result Recording

After Task 28, update:

- `docs/task-22-device-school-network-qa-results.md`;
- Task 20.1 student-pilot readiness sign-off, if the result is pass or approved partial;
- any follow-up stabilization task if the result is partial or fail.

Record:

- date, location if relevant, and network;
- device model, browser, orientation, and approximate viewport;
- dry-run participant code used;
- session ID, if visible in Supabase;
- pass, partial, or fail for each device/network;
- privacy exception row count;
- screenshots or short notes for layout/network issues.

Do not paste Supabase secret keys, real student names, contact information, school account identifiers, or the name-to-code matching list into any QA result file.

## Research Interpretation Guardrail

Task 28 can support RQ2 readiness only in the narrow sense that the system can capture process, exposure, and engagement events under classroom-like device and network conditions.

It does not demonstrate student learning outcomes, historical empathy, evidence-use quality, transfer, or argumentation quality. Those claims require the approved HEA, HNET, Transfer Task, PAQ, scoring rubrics, and focus group evidence.

## Field Sheet

| Device | Browser | Network | Code | Session ID | Core flow | Supabase rows | Privacy rows | Result | Key issue / fallback |
|---|---|---|---|---|---|---|---:|---|---|
| Laptop/desktop | TBC | Home/individual network | `YW-001` | TBC | TBC | TBC | TBC | TBC | Required in-scope check. |
| iPad | Deferred | Deferred | `YW-001` | Deferred | Deferred | Deferred | Deferred | Deferred | Reopen only if iPad is included. |
| Phone | Deferred | Deferred | `YW-002` | Deferred | Deferred | Deferred | Deferred | Deferred | Reopen only if phone is included. |
| Fallback network | TBC | Hotspot | `YW-002` | TBC | TBC | TBC | TBC | TBC | Use only if primary network is unstable. |
