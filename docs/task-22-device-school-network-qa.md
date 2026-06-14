# Task 22 Device / School Network QA

Status: QA protocol prepared; results still TBC  
Formal research data collection status: not approved until this QA is completed and reviewed

## Purpose

Task 22 defines the final device and school-network QA procedure before a limited classroom pilot. It checks whether students can reliably access, log in to, and play the research version on the actual device and network conditions expected in class.

Use dry-run participant codes for this QA. Do not use real student names, student IDs, school account identifiers, emails, phone numbers, or the name-to-code matching list.

## Current Pilot Markers

| Marker | Value |
|---|---|
| Research URL | `https://yangwu-research-simulation-app.vercel.app/?mode=research` |
| APP_VERSION | `lkkc-pilot-v1.0` |
| RESEARCH_COHORT | `lkkc-may-june-2026` |
| content_map_version | `content-freeze-lite-v0.1` |
| Supabase project | `yangwu-research-lkkc-2026` |
| Dry-run code | `YW-001` or `YW-002` |
| Dry-run session code | `LKKC-2026-DRYRUN` |

## Minimum Device Matrix

Complete at least these checks before real student use:

| Device / network | Required? | Browser | Notes |
|---|---:|---|---|
| Desktop or laptop | Yes | Chrome, Edge, or Safari | Baseline teacher/researcher control test. |
| iPad | Yes | Safari or Chrome | Most important classroom tablet check. |
| Student-sized phone | Yes | Safari or Chrome | Checks small-screen login, map, modal, and decision controls. |
| School Wi-Fi / intended classroom network | Yes | Any target device | Confirms Vercel and Supabase API access from school. |
| Mobile hotspot fallback | Recommended | Any target device | Useful if school network blocks or slows the site. |

## What To Test On Each Device

For each device/browser combination:

1. Open `https://yangwu-research-simulation-app.vercel.app/?mode=research`.
2. Confirm the research login appears.
3. Log in with a dry-run participant code and `LKKC-2026-DRYRUN`.
4. Confirm wrong session code is rejected if time permits.
5. Start or continue the game.
6. Enter at least one city.
7. Complete at least one evidence task.
8. Open at least one historical event.
9. Select at least one decision.
10. Open and close the journal.
11. Check that event modal content fits within the viewport.
12. Check that map labels/seals remain usable.
13. Check that the device does not require rotation to continue.
14. Record any slow images, audio issues, layout overlap, horizontal scrolling, or blocked interaction.

## Pass / Partial / Fail Criteria

| Result | Meaning |
|---|---|
| Pass | Device can open the research URL, log in, play through city/evidence/event/decision flow, and write rows to Supabase without major layout or network problems. |
| Partial | Device can complete the flow, but there are notable usability issues, slow loading, layout crowding, or teacher support requirements. |
| Fail | Device cannot log in, cannot reach the site, cannot complete the basic flow, or creates a privacy/data integrity risk. |

Any fail on the primary intended classroom device or school network blocks real student use until fixed or a fallback plan is approved.

## Network Checks

On school Wi-Fi or the actual classroom network:

- [ ] Research URL opens without being blocked.
- [ ] Login API works.
- [ ] Event log API works after gameplay events.
- [ ] Images load sufficiently for gameplay.
- [ ] Audio loading does not block gameplay.
- [ ] Supabase rows appear after login/gameplay.
- [ ] No VPN, teacher login, or personal account is required.

If school Wi-Fi fails but a mobile hotspot works, mark the pilot as conditional and decide whether a hotspot-based fallback is realistic for the actual lesson.

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

- latest QA sessions use dry-run participant codes;
- `app_version = 'lkkc-pilot-v1.0'`;
- `research_cohort = 'lkkc-may-june-2026'`;
- `content_map_version = 'content-freeze-lite-v0.1'`;
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

## Results Template

Use:

```text
docs/task-22-device-school-network-qa-results-template.md
```

Record device, browser, network, login result, basic gameplay result, Supabase row result, privacy QA result, and unresolved issues.

## Approval Rule

Task 22 can be marked passed only when:

- desktop/laptop, iPad, phone, and school-network checks are pass or explicitly approved partial;
- Supabase row checks confirm the pilot markers;
- privacy QA returns zero rows;
- serious layout or network issues have a documented fix or fallback;
- the Task 20.1 sign-off is updated.

Passing Task 22 does not by itself approve the pilot. It clears the device/network QA gate only.
