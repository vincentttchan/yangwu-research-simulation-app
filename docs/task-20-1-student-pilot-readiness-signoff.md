# Task 20.1 Student Pilot Readiness Sign-off

Formal research data collection status: not approved by this public technical sign-off  
Current decision: public technical dry-run record only; formal collection readiness is managed in the private research-operations pack

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
- Device / Browser Tested: desktop browser dry-run confirmed by researcher; iPad and phone checks are deferred; school Wi-Fi is not required for the current home/individual tester plan

## Gate A: Research And Ethics Readiness

| Item | Ready? | Evidence / Notes |
|---|---:|---|
| Consent procedures ready | Yes | Researcher confirmed on 2026-06-16 that consent / school procedure has already been completed and does not need further Codex follow-up. |
| Participant/session codes prepared | Private ops only | Dry-run QA codes exist for technical testing. Formal participant/session-code preparation is handled in the private research-operations pack and should not be recorded in this public app repository. |
| Name-to-code list stored outside Supabase and Git | Yes / must maintain | Research design requires the name-to-code matching list to remain outside Supabase and outside the repository. No such list is stored in this app repo. |
| Instruments ready to administer | Private ops only | Instrument administration and scoring readiness are handled outside the public app repository. |
| Written notes handling confirmed | Private ops only | Written-note collection and storage procedures are handled outside the public app repository. |
| HEA/HNET/Transfer/PAQ coding plan ready | Private ops only | Rubric and coding workflow details are handled outside the public app repository. |

## Gate B: App And Content Freeze Readiness

| Item | Ready? | Evidence / Notes |
|---|---:|---|
| APP_VERSION fixed for pilot | Yes | Current value is `lkkc-pilot-v1.0`, frozen by Task 20.2 for the LKKC pilot cycle. Task 20.3 confirmed deployed Supabase `game_sessions` and `event_logs` rows show this value. |
| RESEARCH_COHORT fixed for pilot | Yes | Current value is `lkkc-may-june-2026`, matching the planned school/research window. |
| Content map version visible in event rows | Yes | The app sends `content-freeze-lite-v0.1` through the login/session and event logging path. Task 20.3 confirmed this value in the deployed dry-run row check. |
| Stable research IDs checked | Yes | `docs/research-id-map.md` defines stable route, city, event, evidence-task, construct, and complexity-dimension IDs. |
| Intervention/comparison descriptions ready | Private ops only | Final teacher-facing and student-facing activity scripts are handled outside the public app repository. |
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
| iPad test passed | Deferred | Temporarily paused on 2026-06-16. Must be reopened only if iPad is included in the formal device scope. |
| Phone test passed | Deferred | Temporarily paused on 2026-06-16. Must be reopened only if phone is included in the formal device scope. |
| Desktop/laptop test passed | Partial | Desktop development and Vercel dry-run have been used. Final in-scope browser/device check remains a private operations decision. |
| School network or intended network checked | N/A for school Wi-Fi; TBC for final in-scope network | School Wi-Fi is no longer required because testers may complete the activity at home. Final home/individual tester network dry-run is still recommended. |
| Login screen usable on target devices | Partial | Desktop/laptop research login works; iPad/phone checks are deferred unless included. |
| Map and modal layout usable on target devices | Partial | Public responsive QA records exist. A later normal-flow QA item remains open and should not be treated as a formal collection clearance. |
| Backup instruction prepared | No | A short teacher/researcher fallback procedure should be prepared before student use. |

## Gate E: Export And Monitoring Readiness

| Item | Ready? | Evidence / Notes |
|---|---:|---|
| Researcher export workflow understood | Yes | Manual Supabase view export workflow has been discussed and documented in Task 18/19. |
| Secure CSV storage location decided | Private ops only | Real exported research CSVs must remain outside the public repository. |
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
- Device QA notes: desktop dry-run confirmed; iPad and phone are deferred; school Wi-Fi is no longer required for the current home/individual tester plan.

## Unresolved Issues

| Issue | Severity | Required Before Pilot? | Owner | Action |
|---|---|---:|---|---|
| Complete private formal collection readiness gate | High | Yes | Vincent / school | Use the private research-operations pack as the final go/no-go checklist before real student data collection. |
| Complete final in-scope network/device QA | High | Yes | Vincent | Test the deployed research URL on the actual home/individual tester network and in-scope device scope. iPad/phone remain deferred unless included. |
| Finalise private participant/session-code workflow | High | Yes | Vincent / school | Prepare pseudonymous codes in private operations storage only; keep identity mapping outside Supabase and Git. |
| Consent and school procedure | Complete | No further Codex action | Vincent / school | Researcher confirmed this was already completed on 2026-06-16. |
| Finalise teacher/researcher classroom runbook details | Medium | Yes | Vincent / school | Complete operational details in private files, not in the public app repository. |
| Decide secure storage location for exported CSV files | Medium | Yes | Vincent | Use a private controlled folder, not the public app repository. |
| Run final CSV export QA on the latest Supabase export package | Medium | Yes | Vincent / Codex | Export six CSV files after final rehearsal and run the QA command. |

## Decision

Select one:

- [ ] Approved for limited pilot
- [ ] Approved with conditions
- [x] Not approved

Decision rationale:

The technical dry-run pipeline is substantially in place: research login, Supabase session/event logging, export views, CSV manifest, local QA checks, and the Task 20.2/20.3 pilot version verification are prepared. Consent/school procedure is treated as complete based on researcher confirmation, and school Wi-Fi is no longer required because testers may complete the activity at home. However, this public file does not approve formal data collection. Final operational readiness, participant/session-code handling, instrument administration, export storage, and sign-off belong in the private research-operations pack.

Required follow-up before student use:

1. Complete the private formal collection readiness gate.
2. Complete Task 22 final in-scope network/device QA results using Task 28 as the field checklist; home/individual network is acceptable.
3. Prepare participant/session codes only in private operations storage and keep the identity map outside Supabase/Git.
4. Confirm instrument administration, written-note handling, and final runbook details against the completed consent/school procedure.
5. Re-export the six CSV files from Supabase and run CSV QA on the final rehearsal package.

This public sign-off remains a technical dry-run record. It should not be used as the formal collection-day approval document.
