# Task 20.1 Student Pilot Readiness Sign-off

Formal research data collection status: not approved yet  
Current decision: not approved for real student use until the required follow-up items are resolved

## Pilot Metadata

- Review Date: 2026-06-14
- Reviewer / Operator: Vincent Chan with Codex support
- School: Lok Sin Tong Leung Kau Kui College
- Class / Group: TBC
- Intended Pilot Date: May-June 2026 research window; exact lesson date TBC
- Deployment URL: `https://yangwu-research-simulation-app.vercel.app/?mode=research`
- Supabase Project: `yangwu-research-lkkc-2026`
- APP_VERSION: `lkkc-pilot-v1.0`
- RESEARCH_COHORT: `lkkc-may-june-2026`
- Content Map Version: `content-freeze-lite-v0.1`
- Device / Browser Tested: desktop browser dry-run confirmed by researcher; iPad, phone, and school-network checks still TBC

## Gate A: Research And Ethics Readiness

| Item | Ready? | Evidence / Notes |
|---|---:|---|
| Consent procedures ready | Partial | Consent approach has been discussed in the research planning cycle, but final school-facing consent materials and implementation timing still need final confirmation before real students use the research mode. |
| Participant/session codes prepared | Partial | Dry-run codes `YW-001`, `YW-002`, and excluded test code `YW-999` exist for `LKKC-2026-DRYRUN`. Real pilot participant/session code list is TBC. |
| Name-to-code list stored outside Supabase and Git | Yes / must maintain | Research design requires the name-to-code matching list to remain outside Supabase and outside the repository. No such list is stored in this app repo. |
| Instruments ready to administer | Partial | Instrument design has been planned and revised, but final classroom-ready administration package should be confirmed before pilot use. |
| Written notes handling confirmed | Partial | Written notes are accepted as analysis data in the research design, but the storage location and collection procedure should be confirmed in the final classroom runbook. |
| HEA/HNET/Transfer/PAQ coding plan ready | Partial | Rubric and coding logic have been designed. A short scorer calibration procedure is still recommended before outcome analysis. |

## Gate B: App And Content Freeze Readiness

| Item | Ready? | Evidence / Notes |
|---|---:|---|
| APP_VERSION fixed for pilot | Yes | Current value is `lkkc-pilot-v1.0`, frozen by Task 20.2 for the LKKC pilot cycle. Task 20.3 confirmed deployed Supabase `game_sessions` and `event_logs` rows show this value. |
| RESEARCH_COHORT fixed for pilot | Yes | Current value is `lkkc-may-june-2026`, matching the planned school/research window. |
| Content map version visible in event rows | Yes | The app sends `content-freeze-lite-v0.1` through the login/session and event logging path. Task 20.3 confirmed this value in the deployed dry-run row check. |
| Stable research IDs checked | Yes | `docs/research-id-map.md` defines stable route, city, event, evidence-task, construct, and complexity-dimension IDs. |
| Intervention/control condition descriptions ready | Partial | The design distinguishes scaffolded and standard/control-style conditions. Final teacher-facing condition script should be locked before classroom use. |
| Content-change log location prepared | Partial | Recommended: keep a private `pilot-change-log` note outside the public app repo for any changes after freeze. |

## Gate C: Technical And Data Readiness

| Item | Ready? | Evidence / Notes |
|---|---:|---|
| `?mode=research` login works | Yes | Vercel research URL is established. Task 20.3 live dry-run QA passed after redeployment. |
| Non-research URL remains playable | Yes | Research gate appears only in research mode; normal non-research gameplay remains accessible. |
| Wrong/excluded codes fail | Yes for dry-run | Dry-run QA design includes rejected excluded code `YW-999` and wrong session-code checks. |
| `game_sessions` rows created | Yes for dry-run | User confirmed Supabase `game_sessions` / event pipeline checks during Task 19. |
| `event_logs` rows created and linked | Yes for dry-run | Task 15/19 pipeline writes event logs through the server route and keeps them linked to sessions. |
| Event payload privacy checks pass | Yes for code-level QA | Server allowlist excludes visible prose, names, emails, phone numbers, student IDs, written responses, and name-to-code fields. Repeat privacy SQL check after final rehearsal. |
| Privacy exception export has zero rows | Yes for current dry-run state | User reported `dataset_privacy_exceptions.csv` was empty/zero-row and manually created as header-only. This is acceptable for dry-run. |
| Six CSV files exported or header-only where appropriate | Yes for dry-run | User exported or manually created the six expected CSVs, including header-only assessment/privacy files where no rows existed. |
| CSV export QA passes | Yes for fixture/local QA; final export TBC | Local QA scripts pass. The final real export folder should be checked again with `npm run check:research-csv-export -- /path/to/export-folder`. |
| Vercel/Supabase secret boundary checked | Yes | Supabase credentials are server-side only; frontend code does not import Supabase SDK or expose `SUPABASE_SECRET_KEY`. |

## Gate D: Device And Classroom Readiness

| Item | Ready? | Evidence / Notes |
|---|---:|---|
| iPad test passed | TBC | Must be tested on the intended iPad/browser before pilot. |
| Phone test passed | TBC | Must be tested on at least one common student phone size before pilot. |
| Desktop/laptop test passed | Partial | Desktop development and Vercel dry-run have been used. Final classroom browser/device check still recommended. |
| School network or intended network checked | TBC | Must be tested on school Wi-Fi or the actual network used during the lesson. |
| Login screen usable on target devices | TBC | Needs final iPad/phone QA with `?mode=research`. |
| Map and modal layout usable on target devices | TBC | Needs final iPad/phone QA, especially map layout, event modal height, and decision controls. |
| Backup instruction prepared | No | A short teacher/researcher fallback procedure should be prepared before student use. |

## Gate E: Export And Monitoring Readiness

| Item | Ready? | Evidence / Notes |
|---|---:|---|
| Researcher export workflow understood | Yes | Manual Supabase view export workflow has been discussed and documented in Task 18/19. |
| Secure CSV storage location decided | TBC | Decide a private local/cloud folder controlled by the researcher; do not store exported research CSVs in the public repository. |
| Header-only CSV handling understood | Yes | Empty `assessment_scores` and `privacy_exceptions` views can be represented by header-only CSVs for QA. |
| Engagement/exposure interpretation boundary understood | Yes | Event counts and complexity exposure are process/exposure indicators, not direct evidence of learning gains. |
| Assessment-score analysis boundary understood | Yes | Learning outcome claims require scored HEA, HNET, Transfer Task, PAQ, and qualitative evidence where appropriate. |

## Dry-run Evidence Reviewed

- Latest Task 19 result note: Task 19 dry-run process completed through user-confirmed Supabase checks and CSV handling; formal written result note still recommended. Task 20.2 froze `APP_VERSION` to `lkkc-pilot-v1.0`; Task 20.3 confirmed this marker in deployed rows.
- Supabase row QA: `game_sessions` and `event_logs` were checked by the user on 2026-06-14 after redeployment; latest rows show `lkkc-pilot-v1.0`.
- CSV export folder: TBC; do not commit real exported CSVs to Git.
- CSV QA command: `npm run check:research-csv-export -- /path/to/export-folder`
- CSV QA result: local Task 18/19/20 checks passed; final exported folder QA still TBC.
- Privacy QA result: current privacy exception export is zero-row/header-only; repeat before pilot.
- Device QA notes: desktop dry-run only confirmed in this sign-off; iPad, phone, and school-network QA remain open.

## Unresolved Issues

| Issue | Severity | Required Before Pilot? | Owner | Action |
|---|---|---:|---|---|
| Complete iPad, phone, and school-network QA | High | Yes | Vincent | Task 22 QA protocol and results template are prepared. Test the deployed research URL on target devices and record results before student use. |
| Finalise real participant/session code list | High | Yes | Vincent / school | Prepare pseudonymous codes; keep the name-to-code matching list outside Supabase and Git. |
| Confirm consent and classroom administration materials | High | Yes | Vincent / school | Confirm final materials before students use research mode. |
| Finalise teacher/researcher classroom runbook details | Medium | Yes | Vincent / school | Task 21 runbook is prepared. Fill in class/group, exact session code, real code distribution, room/network details, and any school-specific instructions before student use. |
| Decide secure storage location for exported CSV files | Medium | Yes | Vincent | Use a private controlled folder, not the public app repository. |
| Run final CSV export QA on the latest Supabase export package | Medium | Yes | Vincent / Codex | Export six CSV files after final rehearsal and run the QA command. |

## Decision

Select one:

- [ ] Approved for limited pilot
- [ ] Approved with conditions
- [x] Not approved

Decision rationale:

The technical dry-run pipeline is substantially in place: research login, Supabase session/event logging, export views, CSV manifest, local QA checks, and the Task 20.2/20.3 pilot version verification are prepared. However, target-device/classroom QA is incomplete, real participant/session code preparation is not yet documented, and final consent/classroom administration details remain to be confirmed. Therefore the project should not yet be used with real students.

Required follow-up before student use:

1. Complete Task 22 iPad, phone, desktop/laptop, and school-network QA results.
2. Prepare real participant/session codes and keep the name-to-code list outside Supabase/Git.
3. Confirm consent, instrument administration, written-note handling, and final classroom runbook details.
4. Re-export the six CSV files from Supabase and run CSV QA on the final rehearsal package.
