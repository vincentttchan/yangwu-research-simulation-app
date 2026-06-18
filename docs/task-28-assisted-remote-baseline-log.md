# Task 28 Assisted Remote Baseline Log

Date: 2026-06-15 HKT  
Status: assistant-assisted remote baseline completed; real iPad, phone, and school Wi-Fi QA still TBC  
Formal research data collection status: not approved

## Scope

This log records the parts of Task 28 that can be checked remotely from the production deployment.

It does not replace real device QA. The actual iPad, phone, and school Wi-Fi checks must still be completed on the intended school devices and network before any real student pilot.

## Production URL Check

| Item | Result | Evidence |
|---|---|---|
| Research URL opens | Pass | `https://yangwu-research-simulation-app.vercel.app/?mode=research` loaded in browser baseline. |
| Page title visible | Pass | `自強三十年 · 踏遍九州之旅`. |
| Research login appears | Pass | `研究登記` modal appeared with participant code and session code fields. |
| No personal-data field shown | Pass | Login asked for participant code and session code only. |

## Login API Check

Direct API check with complete research payload:

```json
{
  "participant_code": "YW-001",
  "session_code": "LKKC-2026-DRYRUN",
  "app_version": "lkkc-pilot-v1.0",
  "research_cohort": "lkkc-may-june-2026",
  "content_map_version": "content-freeze-lite-v0.1",
  "device": {
    "category": "desktop",
    "viewport_width": 1280,
    "viewport_height": 720,
    "browser_family": "codex-browser-baseline"
  }
}
```

Result:

```json
{
  "session_id": "d5fadaca-a810-466b-a736-4dd5b4855368",
  "participant_code": "YW-001",
  "class_id": "LKKC-S4A",
  "condition": "scaffolded",
  "app_version": "lkkc-pilot-v1.0",
  "research_cohort": "lkkc-may-june-2026",
  "content_map_version": "content-freeze-lite-v0.1"
}
```

Interpretation: production login API is reachable and returns the intended pilot markers when the complete frontend-style payload is supplied.

## Environment Diagnostic Check

The production diagnostic endpoint returned:

- `backend_enabled = dry_run`
- `supabase_url_present = true`
- `supabase_url_ref = zjmuydbuskxouqlkcspy`
- `supabase_url_matches_expected = true`
- `supabase_schema = public`
- `research_cohort = lkkc-may-june-2026`
- `app_version = lkkc-pilot-v1.0`

Note: the diagnostic reports `supabase_secret_key_ref = null`, which is expected because the secret key is not a URL and should not expose project details publicly. The important deployment check is that the secret is present server-side and the login API can write a session row.

## Browser UI Baseline

| Check | Result | Notes |
|---|---|---|
| Research login fields uniquely targetable | Pass | Participant code field, session code field, and submit button were each found once. |
| Dry-run login through visible UI | Pass for login dismissal | After submitting `YW-001` and `LKKC-2026-DRYRUN`, the research login panel became hidden/display none. |
| Overlay state after login | Needs real-device check | Opening/tutorial overlays remain part of the flow and should be checked manually on iPad and phone for touch blocking. |

## Remaining Required Real-World Checks

Task 28 is not complete until these are tested in the actual school context:

- iPad Safari or Chrome on school Wi-Fi;
- student-sized phone Safari or Chrome on school Wi-Fi;
- school Wi-Fi access to Vercel page, login API, and event log API;
- media loading under school network conditions;
- event rows visible after real device gameplay;
- `research_privacy_exception_export` returns zero rows after the real device run.

## Decision

Remote baseline result: Pass  
Task 28 overall result: Pending

Reason: production URL and login API are reachable, but real iPad, phone, and school Wi-Fi testing remains incomplete.

