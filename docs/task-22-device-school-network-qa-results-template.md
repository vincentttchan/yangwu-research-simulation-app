# Task 22A Device / School Network QA Results Template

Formal research data collection status: not approved until this result sheet is completed and reviewed

## QA Metadata

- QA Date:
- Operator:
- Location:
- Room:
- Network:
- Deployment URL: `https://yangwu-research-simulation-app.vercel.app/?mode=research`
- APP_VERSION: `lkkc-pilot-v1.0`
- RESEARCH_COHORT: `lkkc-may-june-2026`
- content_map_version: `content-freeze-lite-v0.1`
- Dry-run participant code(s): `YW-001`, `YW-002`
- Dry-run session code: `LKKC-2026-DRYRUN`
- School Wi-Fi tested:
- Hotspot fallback tested:

## Device Matrix

| Device | Browser | Network | Viewport / orientation | Login works? | City/evidence/event/decision works? | Journal/modal usable? | Supabase rows verified? | Result | Notes |
|---|---|---|---|---:|---:|---:|---:|---|---|
| Desktop/laptop |  |  |  |  |  |  |  |  |  |
| iPad |  |  |  |  |  |  |  |  |  |
| Phone |  |  |  |  |  |  |  |  |  |
| School Wi-Fi check |  | School Wi-Fi |  |  |  |  |  |  |  |
| Hotspot fallback, if used |  | Hotspot |  |  |  |  |  |  |  |

Use `Pass`, `Partial`, or `Fail` in the Result column.

## Per-Device Checklist

For each device, record `Yes`, `No`, or `Partial`.

| Check | Desktop/laptop | iPad | Phone | School Wi-Fi device | Notes |
|---|---:|---:|---:|---:|---|
| Research URL opens |  |  |  |  |  |
| Research login appears |  |  |  |  |  |
| `YW-001` or `YW-002` login works |  |  |  |  |  |
| Wrong code/session rejection works, if tested |  |  |  |  |  |
| Map loads and fills viewport |  |  |  |  |  |
| City entry works |  |  |  |  |  |
| Evidence task works |  |  |  |  |  |
| Historical event opens |  |  |  |  |  |
| Decision selection works |  |  |  |  |  |
| Journal opens/closes |  |  |  |  |  |
| Event modal height usable |  |  |  |  |  |
| No horizontal scrolling / major overlap |  |  |  |  |  |
| Refresh/recovery acceptable |  |  |  |  |  |

## Supabase Row Verification

- Latest `game_sessions` checked:
- Latest `event_logs` checked:
- `app_version = lkkc-pilot-v1.0` confirmed:
- `research_cohort = lkkc-may-june-2026` confirmed:
- `content_map_version = content-freeze-lite-v0.1` confirmed:
- Device fields populated:
- Event coverage observed:
- Multiple sessions created by refresh?:
- Notes:

## Privacy QA

- `research_privacy_exception_export` checked:
- Number of rows returned:
- Result:
- Notes:

Expected result: zero data rows.

## Layout / Usability Notes

| Area | Issue observed? | Device | Severity | Action |
|---|---:|---|---|---|
| Research login |  |  |  |  |
| Map labels/seals |  |  |  |  |
| Event modal height |  |  |  |  |
| Decision controls |  |  |  |  |
| Journal |  |  |  |  |
| Image/audio loading |  |  |  |  |
| Horizontal scrolling / overlap |  |  |  |  |
| Refresh/recovery |  |  |  |  |

## Network Notes

- School Wi-Fi access:
- Vercel site blocked?:
- Login API blocked?:
- Event log API blocked?:
- Images/audio unusually slow?:
- Hotspot fallback needed?:
- VPN, teacher login, or student account required?:
- Notes:

## Evidence

- Screenshots taken:
- Supabase row screenshots/notes:
- Privacy QA screenshot/note:
- Device issue screenshots/notes:

Do not include student names, student IDs, emails, phone numbers, school account identifiers, Supabase secrets, or the name-to-code list.

## Decision

Select one:

- [ ] Device/network QA passed
- [ ] Device/network QA passed with conditions
- [ ] Device/network QA failed

Decision rationale:

Required follow-up before student use:
