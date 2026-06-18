# Task 22 Device / School Network QA

Task 22A checklist version

Status: checklist prepared; live school-site results still TBC
Formal research data collection status: not approved until this QA is completed, reviewed, and recorded

## Purpose

Task 22A is the pre-pilot device and network readiness checklist for the Yangwu research simulation. It confirms that the deployed research version can be opened, logged into, played, and logged to Supabase under the actual classroom device and network conditions expected at Lok Sin Tong Leung Kau Kui College.

This is a technical and classroom-readiness gate, not a student-data collection activity. Use dry-run participant codes only.

Do not use real student names, student IDs, school account identifiers, emails, phone numbers, written student responses, or the name-to-code matching list during this QA.

## Current Pilot Markers

| Marker | Value |
|---|---|
| Research URL | `https://yangwu-research-simulation-app.vercel.app/?mode=research` |
| APP_VERSION | `lkkc-pilot-v1.0` |
| RESEARCH_COHORT | `lkkc-may-june-2026` |
| content_map_version | `content-freeze-lite-v0.1` |
| Supabase project | `yangwu-research-lkkc-2026` |
| Dry-run participant codes | `YW-001`, `YW-002` |
| Wrong-code test, optional | `YW-999` |
| Dry-run session code | `LKKC-2026-DRYRUN` |

## Go / No-Go Rule

The pilot is not cleared for real students unless all of the following are true:

- desktop/laptop baseline check passes;
- iPad check passes or has an explicitly acceptable workaround;
- student-sized phone check passes or is declared non-primary with a fallback;
- School Wi-Fi or the actual classroom network can access the Vercel site and API routes;
- Supabase `game_sessions` and `event_logs` rows are created with the current pilot markers;
- Privacy QA returns zero rows;
- any partial result has a concrete classroom fallback.

Any fail on the primary classroom device or the school network blocks real student use until fixed or formally bypassed with a fallback plan.

## Minimum Device Matrix

Complete at least these checks before real student use:

| Device / network | Required? | Browser | Why it matters |
|---|---:|---|---|
| Desktop or laptop | Yes | Chrome, Edge, or Safari | Baseline teacher/researcher control test. |
| iPad | Yes | Safari or Chrome | Most important classroom tablet check. |
| Student-sized phone | Yes | Safari or Chrome | Checks small-screen login, map, modal, and decision controls. |
| School Wi-Fi / intended classroom network | Yes | Any target device | Confirms Vercel and Supabase API access from school. |
| Mobile hotspot fallback | Recommended | Any target device | Useful if school network blocks or slows the site. |
| Spare device | Recommended | Any available browser | Allows recovery if one student device fails. |

## Pre-Site Preparation

Complete before going to the classroom:

- [ ] Review the public responsive QA records. If normal-flow QA is reopened, record any unresolved issue separately before treating it as passed.
- [ ] Confirm the latest Vercel production deployment is ready.
- [ ] Open the research URL on one non-school network.
- [ ] Confirm the login screen appears only with `?mode=research`.
- [ ] Confirm `YW-001` + `LKKC-2026-DRYRUN` logs in.
- [ ] Confirm an invalid code or wrong session code is rejected.
- [ ] Confirm `APP_VERSION`, `RESEARCH_COHORT`, and `content_map_version` match the table above.
- [ ] Confirm Supabase SQL Editor access is available to the researcher only.
- [ ] Prepare the results sheet from `docs/task-22-device-school-network-qa-results-template.md`.
- [ ] Prepare a fallback plan: mobile hotspot, spare device, or paper observation task.

## On-Site Network Checks

Run these on School Wi-Fi or the actual classroom network:

- [ ] Research URL opens without being blocked.
- [ ] Login API works.
- [ ] Event log API works after gameplay events.
- [ ] Images load sufficiently for gameplay.
- [ ] Audio loading does not block gameplay.
- [ ] Supabase rows appear after login/gameplay.
- [ ] No VPN, teacher login, student school account, or personal account is required.
- [ ] Page remains usable after refresh or accidental back navigation.

If School Wi-Fi fails but a mobile hotspot works, mark the pilot as conditional and decide whether a hotspot-based fallback is realistic for the actual lesson.

## Per-Device Gameplay Script

Run this once per device/browser combination:

1. Open `https://yangwu-research-simulation-app.vercel.app/?mode=research`.
2. Confirm the research login appears.
3. Log in with `YW-001` or `YW-002` and `LKKC-2026-DRYRUN`.
4. If time permits, confirm a wrong session code is rejected.
5. Start the game and select the Li Hongzhang route.
6. Continue through the route cutscene until the map reaches the playable state.
7. Confirm Beijing is the first normal historical target.
8. Open and close the event drawer.
9. Open and close the stats drawer on phone, or confirm the iPad stats panel remains readable.
10. Open and close the journal.
11. Enter Beijing.
12. Confirm the first historical event modal fits the viewport and its action/footer is reachable.
13. Select one event decision and continue.
14. Open `bj-wall` or another Beijing evidence hotspot.
15. Confirm the evidence task modal fits the viewport.
16. Complete one evidence task, if time permits.
17. On phone/iPad, confirm the map does not require rotation.
18. Refresh once and confirm the student can continue or restart without a confusing dead end.

Record slow images, audio delay, layout overlap, horizontal scrolling, blocked taps, keyboard/input problems, or repeated login/session issues.

## Layout And Usability Checklist

### Research Login

- [ ] Login panel fits on phone portrait.
- [ ] Participant code input and session code input are easy to tap.
- [ ] Error message is readable when the wrong code is entered.
- [ ] No personal-data field is shown.

### Map

- [ ] Map fills the visible viewport.
- [ ] No large blank black area appears.
- [ ] No horizontal scrolling occurs.
- [ ] City seals/labels are readable enough to choose a city.
- [ ] Mobile event tab and journal button remain tappable.
- [ ] Mobile stats drawer opens and closes correctly.
- [ ] iPad side panels do not cover too much of the map.

### City / Evidence / Event

- [ ] City scene opens without broken images.
- [ ] Hotspots are tappable.
- [ ] Evidence task can be completed.
- [ ] Historical event modal height is usable.
- [ ] Decision choices fit without text clipping.
- [ ] Return-to-map flow is clear.

### Journal / Recovery

- [ ] Journal opens.
- [ ] Journal closes.
- [ ] Refresh or accidental navigation does not create a research-data integrity problem.
- [ ] Researcher can identify the session in Supabase after the device test.

## Supabase Verification After Device QA

Run:

```sql
select
  participant_code,
  session_id,
  device_category,
  viewport_width,
  viewport_height,
  browser_family,
  app_version,
  research_cohort,
  content_map_version,
  started_at
from game_sessions
order by started_at desc
limit 20;
```

Then run:

```sql
select
  participant_code,
  session_id,
  event_type,
  app_version,
  research_cohort,
  content_map_version,
  server_time
from event_logs
order by server_time desc
limit 50;
```

Expected:

- latest QA sessions use dry-run participant codes only;
- `app_version = 'lkkc-pilot-v1.0'`;
- `research_cohort = 'lkkc-may-june-2026'`;
- `content_map_version = 'content-freeze-lite-v0.1'`;
- device fields are populated enough to distinguish desktop, tablet, and phone;
- event types include several of `session_start`, `city_entered`, `evidence_task_completed`, `event_opened`, and `decision_selected`.

## Privacy QA

Run:

```sql
select *
from research_privacy_exception_export
limit 20;
```

Expected: zero data rows.

If rows appear, stop before any student pilot and inspect the payload issue.

## Result Categories

| Result | Meaning |
|---|---|
| Pass | Device can open the research URL, log in, play through city/evidence/event/decision flow, and write rows to Supabase without major layout or network problems. |
| Partial | Device can complete the flow, but there are notable usability issues, slow loading, layout crowding, or teacher support requirements. |
| Fail | Device cannot log in, cannot reach the site, cannot complete the basic flow, or creates a privacy/data integrity risk. |

## Evidence To Keep

Keep the following in the results file:

- device/browser/network tested;
- pass/partial/fail result for each device;
- Supabase `game_sessions` and `event_logs` confirmation;
- privacy QA row count;
- screenshots or short notes for any layout issue;
- fallback plan if any result is partial.

Do not paste Supabase secret keys, student names, phone numbers, emails, school account identifiers, or the name-to-code list into the results file.

## Results Template

Use:

```text
docs/task-22-device-school-network-qa-results-template.md
```

Record device, browser, network, login result, basic gameplay result, Supabase row result, privacy QA result, and unresolved issues.

## Approval Rule

Task 22A can be marked passed only when:

- desktop/laptop, iPad, phone, and school-network checks are pass or explicitly approved partial;
- Supabase row checks confirm the pilot markers;
- privacy QA returns zero rows;
- serious layout or network issues have a documented fix or fallback;
- the Task 20.1 sign-off is updated.

Passing Task 22A does not by itself approve the pilot. It clears the device/network QA gate only.
