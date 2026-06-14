# Task 21 Teacher / Classroom Pilot Runbook

Status: classroom runbook prepared; final school/device details still require confirmation  
Formal research data collection status: not approved until consent, real codes, device QA, and final export QA are complete

## Purpose

This runbook gives the teacher/researcher a practical procedure for running a limited classroom pilot of the Yangwu historical simulation at Lok Sin Tong Leung Kau Kui College.

It covers:

- pre-lesson technical and research checks;
- teacher and researcher roles;
- student login instructions;
- classroom timing;
- iPad, phone, desktop/laptop, and school-network QA;
- fallback actions if the site, device, or network fails;
- stop conditions;
- post-lesson Supabase and CSV export checks.

It does not approve formal research data collection by itself.

## Current Pilot Markers

| Marker | Value |
|---|---|
| Deployment URL | `https://yangwu-research-simulation-app.vercel.app/?mode=research` |
| APP_VERSION | `lkkc-pilot-v1.0` |
| RESEARCH_COHORT | `lkkc-may-june-2026` |
| content_map_version | `content-freeze-lite-v0.1` |
| Supabase project | `yangwu-research-lkkc-2026` |

## Roles

| Role | Main responsibility | Should not do |
|---|---|---|
| Teacher | Classroom flow, historical framing, timekeeping, basic student support. | Do not view or handle the name-to-code matching list unless agreed by the school/research procedure. |
| Researcher | Participant code preparation, consent tracking, technical monitoring, field notes, export QA. | Do not enter real names, student IDs, emails, or phone numbers into Supabase or the app. |
| Student | Use the assigned participant code and session code, play the simulation, complete assigned instruments. | Do not use classmates' participant codes or enter personal information into the game. |
| Technical helper, if available | Device/network troubleshooting only. | Do not access Supabase keys, research exports, or name-to-code files. |

## Pre-Lesson Checklist

Complete this before real students use the research mode.

### Research And Consent

- [ ] School permission and consent procedures are confirmed.
- [ ] Students included in the pilot have the required consent/assent status.
- [ ] Students who should not participate have an alternative activity.
- [ ] The name-to-code matching list is stored outside Supabase and outside Git.
- [ ] Real participant codes are prepared in Supabase `participants`.
- [ ] Real session code is decided and shared only through the classroom procedure.
- [ ] HEA, HNET, Transfer Task, PAQ, and any written-note procedure are ready.

### Technical

- [ ] Vercel deployment opens at `https://yangwu-research-simulation-app.vercel.app/?mode=research`.
- [ ] `APP_VERSION` is `lkkc-pilot-v1.0`.
- [ ] `RESEARCH_BACKEND_ENABLED=dry_run` remains intentional for the pilot rehearsal/pilot stage.
- [ ] Supabase `game_sessions` and `event_logs` have been verified after redeployment.
- [ ] Privacy QA returns zero rows.
- [ ] Six researcher CSV exports can be produced or represented as header-only files where appropriate.
- [ ] `npm run check:research-csv-export -- /path/to/export-folder` passes on the latest rehearsal export.

### Device And Network

- [ ] iPad Safari or Chrome opens the research URL and can log in.
- [ ] At least one common phone opens the research URL and can log in.
- [ ] Desktop/laptop browser opens the research URL and can log in.
- [ ] School Wi-Fi or the actual classroom network can access the Vercel site.
- [ ] Login screen, map, event modal, decision controls, and journal are usable on the intended devices.
- [ ] Audio/images loading slowly does not block the core activity.

## Recommended Lesson Flow

Adjust timing to fit the actual lesson length. The pilot should prioritise a clean research procedure over finishing every game route.

| Time | Activity | Teacher/researcher action | Data note |
|---:|---|---|---|
| 0-5 min | Settle devices and remind students of procedure. | Ask students to use only their assigned code. | No gameplay interpretation yet. |
| 5-8 min | Research login. | Display URL and session code; troubleshoot quietly. | Confirm failed/wrong-code cases are not bypassed. |
| 8-12 min | Brief historical framing. | Frame the Self-Strengthening Movement as a multi-causal historical problem, not only a success/failure story. | Avoid giving model answers for the Transfer Task. |
| 12-32 min | Simulation play. | Let students explore; answer navigation questions, not analytical answers. | Event logs record engagement/exposure only. |
| 32-38 min | Short pause / checkpoint. | Ask students to finish current event or note one historical tension they noticed. | Written notes may be collected only under the approved procedure. |
| 38-45 min | Post-task or transition. | Move to HEA/HNET/Transfer/PAQ or teacher debrief according to the research design. | Outcome claims require scored instruments, not logs alone. |
| After class | Data verification. | Researcher checks Supabase rows and export package. | Record disruptions and exclusions. |

For a longer double lesson, extend simulation play to 35-45 minutes and reserve 15-25 minutes for written tasks or focus-group recruitment.

## Student-Facing Board Instructions

Use concise instructions on the board or projector.

```text
1. Open: https://yangwu-research-simulation-app.vercel.app/?mode=research
2. Enter your participant code exactly as given.
3. Enter today’s session code exactly as shown by the teacher.
4. Do not use another student’s code.
5. Do not type your real name, class number, email, or phone number into the game.
6. If the page freezes, raise your hand before refreshing.
```

Suggested Chinese version:

```text
1. 開啟： https://yangwu-research-simulation-app.vercel.app/?mode=research
2. 輸入你獲分配的參與代碼。
3. 輸入老師展示的課節代碼。
4. 不要使用其他同學的代碼。
5. 不要在遊戲內輸入真名、學號、電郵或電話。
6. 如畫面卡住，請先舉手，不要自行重複刷新。
```

## Teacher Opening Script

Suggested wording:

```text
Today you will explore the Self-Strengthening Movement through a historical simulation. The aim is not to win quickly, but to observe how technology, institutions, finance, politics, public attitudes, and historical actors’ constraints interacted. Please follow the assigned code procedure carefully. The game does not ask for your name or contact information.
```

Suggested Chinese version:

```text
今日我們會透過一個歷史模擬遊戲探索洋務運動。重點不是最快完成，而是觀察技術、制度、財政、政治、民眾態度和歷史人物限制如何互相影響。請按分配的參與代碼登入；遊戲不會要求你輸入真名或聯絡資料。
```

## Support Rules During Play

Allowed teacher/researcher support:

- explain how to log in;
- help a student find a button or close a modal;
- remind students to read evidence before deciding;
- help recover from a refresh or device issue;
- record technical disruptions.

Avoid during research play:

- telling students which choice is historically best;
- explaining the model answer to the Transfer Task;
- interpreting high event counts as better learning;
- changing participant codes informally;
- collecting real identifiers in the game or Supabase.

## Fallback Actions

| Problem | Immediate action | Research note |
|---|---|---|
| Student cannot log in | Check code spelling and session code. If still failing, use a spare included code only if pre-approved. | Record participant code, approximate time, and issue. |
| Student refreshes page | Ask student to log in again with the same code/session code. | Later check whether multiple `game_sessions` rows exist. |
| Site is unavailable for one or two students | Move those students to a spare device if available. | Mark device/network disruption. |
| Site is unavailable for the class | Stop the digital pilot; use backup discussion or paper task. | Do not treat incomplete logs as normal pilot data. |
| Supabase logging appears down | Continue only if the lesson is pedagogically needed; mark the session as technical failure for research. | Do not use incomplete logs for process analysis without caveat. |
| Student uses wrong code | Stop and correct immediately. | Exclude or flag affected session as needed. |
| Personal data is accidentally typed into the app | Stop using that session for analysis and run privacy QA. | Follow deletion/withdrawal procedure if necessary. |

## Stop Conditions

Stop or pause the pilot if:

- the research URL cannot be reached on the intended network;
- multiple students cannot log in with valid codes;
- wrong or excluded codes are accepted;
- privacy QA returns rows containing personal data;
- students are asked to enter names, student IDs, emails, or phone numbers into the app;
- the classroom loses too much time for meaningful participation;
- consent status is unclear for one or more students.

## Post-Lesson Data Procedure

Within the same day if possible:

1. Check latest `game_sessions` rows.
2. Check latest `event_logs` rows.
3. Confirm `app_version = 'lkkc-pilot-v1.0'`.
4. Confirm `research_cohort = 'lkkc-may-june-2026'`.
5. Confirm `content_map_version = 'content-freeze-lite-v0.1'`.
6. Run privacy QA and confirm zero rows.
7. Export the six researcher CSV files:
   - `dataset_session_summary.csv`
   - `dataset_event_log_long.csv`
   - `dataset_complexity_exposure.csv`
   - `dataset_assessment_scores.csv`
   - `dataset_dashboard_overview.csv`
   - `dataset_privacy_exceptions.csv`
8. Run:

```bash
npm run check:research-csv-export -- /path/to/export-folder
```

9. Store CSV files in a private researcher-controlled folder, not the public app repository.
10. Record a field note on timing, device issues, teacher interventions, and any exclusions.

## Supabase Quick Checks

Latest sessions:

```sql
select
  participant_code,
  session_id,
  condition,
  app_version,
  research_cohort,
  content_map_version,
  started_at,
  ended_at,
  completion_status
from game_sessions
order by started_at desc
limit 20;
```

Latest events:

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

Privacy exception view:

```sql
select *
from research_privacy_exception_export
limit 20;
```

The privacy exception query should return zero data rows.

## Field Note Template

```text
Date:
Class / group:
Lesson period:
Room:
Network:
Devices used:
Deployment URL:
Session code:
Number of students present:
Number logged in successfully:
Number with device/login issues:
Major disruptions:
Teacher support given:
Students excluded or absent:
Notes on engagement:
Follow-up required:
```

## Remaining Before Pilot Approval

This runbook closes the classroom-procedure planning gap, but the pilot still requires:

- final iPad, phone, desktop/laptop, and school-network QA;
- real pseudonymous participant/session codes;
- consent and instrument administration confirmation;
- final privacy QA;
- final CSV export QA;
- updated Task 20.1 sign-off decision.
