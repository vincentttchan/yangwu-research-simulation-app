# Research ID Map / Formal Content Freeze

Version: `content-freeze-formal-v1.0`
App baseline: `lkkc-formal-ui-freeze-v1.0`
Logger queue: `yangwu_research_event_queue_v1`
Updated: 2026-06-18

## Purpose

This document defines the stable research-facing IDs used by the Self-Strengthening Movement simulation. It supports logging, Supabase export, and research analysis during the formal collection cycle.

Formal Content Freeze freezes wording, images, layout, and visual polish for the approved collection build. After this freeze, event prose, illustrations, modal design, mobile layout, interaction feel, and teaching language should not change unless the app version and, where relevant, content map version are intentionally bumped and recorded.

Current source of truth: use the header values above and `src/research/content-map.js` for the formal collection build. Later task notes in this file retain earlier pilot and dry-run version values as historical process records only.

## Current Coverage

- Routes: 4
- Cities: 12
- Events: 52
- Evidence tasks: 29

The executable source of truth is `src/research/content-map.js`. This document is the human-readable companion for research discussion, teacher review, and future backend planning.

## ID Policy

| Area | Stable ID rule | Post-freeze rule |
|---|---|---|
| Route | Keep route keys such as `lihongzhang`, `yixin`, `rongheng`, `free` | Changes to character wording, portrait treatment, or route introduction require a recorded version decision. |
| City | Keep city keys such as `beijing`, `shanghai`, `fuzhou` | Changes to city artwork, tagline, layout, or tooltip copy require a recorded version decision. |
| Event | Keep event IDs such as `e_zongli_yamen` and `e_yellow_sea_battle` | Changes to event prose, choice wording, or result style require a recorded version decision. |
| Evidence task | Keep `city:hotspot` IDs such as `beijing:bj-wall` | Changes to task instruction wording, reveal flow, or visual design require a recorded version decision. |
| Research construct | Keep construct labels in `RESEARCH_CONSTRUCTS` | Coding refinements must be documented in the scoring workbook or analysis memo. |

If an ID must be renamed, keep a migration note before collecting research data. During development this is acceptable; after research freeze it should be treated as a schema change.

## Research Constructs

| Construct ID | Meaning in this game |
|---|---|
| `historical_complexity` | Students encounter interacting causes, constraints, and consequences rather than one-factor explanation. |
| `evidence_use` | Students inspect clues, records, observations, or source-like material before judging an event. |
| `historical_empathy` | Students consider actors' positions, constraints, assumptions, and emotional stakes without presentist simplification. |
| `argumentation` | Students weigh claims, causes, consequences, or competing explanations. |
| `chronology` | Students place events in sequence and connect earlier conditions to later outcomes. |
| `comparative_perspective` | Students compare Qing Self-Strengthening with Meiji Japan or wider East Asian developments. |

## Historical Complexity Dimensions

| Dimension ID | Meaning in this game |
|---|---|
| `technology` | Military, industrial, transport, telegraph, shipbuilding, or machine-related modernisation. |
| `institutions` | Administrative structures, yamen, arsenals, naval administration, schools, or enterprise governance. |
| `finance` | Funding, military expenditure, official-enterprise finance, resource constraints, and fiscal weakness. |
| `court_politics` | Conservative resistance, factional conflict, imperial priorities, and central decision-making. |
| `public_attitudes` | Social resistance, local beliefs, anti-foreign sentiment, public understanding, and popular support or opposition. |
| `actor_constraints` | Historical actors' limited information, institutional position, personal networks, and practical trade-offs. |
| `japan_comparison` | Meiji comparison, Sino-Japanese rivalry, naval expansion, and regional pressure. |

## Routes

| Route ID | Label | Research focus |
|---|---|---|
| `lihongzhang` | 李鴻章 | Material self-strengthening, regional power, and practical constraints |
| `yixin` | 奕訢 | Court politics, diplomacy, and institutional constraint |
| `rongheng` | 容閎 | Education, overseas learning, and intellectual change |
| `free` | 自由書記 | Cross-route witness perspective |

## Cities

| City ID | Label | Research focus |
|---|---|---|
| `beijing` | 北京 | Court politics, diplomacy, and conservative resistance |
| `tianjin` | 天津 | Beiyang military administration, telegraphy, and diplomacy |
| `kaiping` | 開平 | Coal mining, railway development, and social resistance |
| `weihaiwei` | 威海 | Beiyang Fleet, naval defence, and war failure |
| `nanjing` | 南京 | Post-rebellion reconstruction and regional military industry |
| `shanghai` | 上海 | Treaty-port industry, arsenals, shipping, and knowledge circulation |
| `wuhan` | 武漢 | Late Self-Strengthening industry and official enterprise limits |
| `fuzhou` | 福州 | Shipbuilding, naval education, and maritime defence |
| `guangzhou` | 廣州 | Treaty ports, trade, and the end of the Canton system |
| `hongkong` | 香港 | Western learning, print culture, and overseas education |
| `korea` | 朝鮮 | Sino-Japanese rivalry and the East Asian crisis |
| `japan` | 日本 | Meiji comparison and regional pressure |

## Events

Event kinds:

- `pinned`: chronology-linked historical event.
- `city_event`: explorable city event.
- `comparison`: Japan / regional comparison event.
- `terminal`: late-game war and settlement event.

| Event ID | City | Kind |
|---|---|---|
| `e_yuanmingyuan` | `beijing` | `pinned` |
| `e_zongli_yamen` | `beijing` | `pinned` |
| `e_tongwen_guan` | `beijing` | `pinned` |
| `e_jiangnan_pinned` | `shanghai` | `pinned` |
| `e_students_depart` | `shanghai` | `pinned` |
| `e_students_return` | `shanghai` | `pinned` |
| `e_shisanhang` | `shanghai` | `city_event` |
| `e_write_yixin` | `shanghai` | `city_event` |
| `e_handle_court` | `shanghai` | `city_event` |
| `e_jiangnan` | `shanghai` | `city_event` |
| `e_chashan_listen` | `shanghai` | `city_event` |
| `e_bj_wall` | `beijing` | `city_event` |
| `e_bj_envoy` | `beijing` | `city_event` |
| `e_bj_woren` | `beijing` | `city_event` |
| `e_tj_haihe` | `tianjin` | `city_event` |
| `e_tj_advisor` | `tianjin` | `city_event` |
| `e_tj_telegraph` | `tianjin` | `city_event` |
| `e_nj_ruins` | `nanjing` | `city_event` |
| `e_nj_liangjiang` | `nanjing` | `city_event` |
| `e_nj_arsenal` | `nanjing` | `city_event` |
| `e_fz_french` | `fuzhou` | `city_event` |
| `e_fz_yan` | `fuzhou` | `city_event` |
| `e_fz_haifang` | `fuzhou` | `city_event` |
| `e_fuzhou_shipyard` | `fuzhou` | `pinned` |
| `e_fuzhou_taiwan` | `fuzhou` | `pinned` |
| `e_fuzhou_mawei` | `fuzhou` | `pinned` |
| `e_tianjin_jiaoan` | `tianjin` | `pinned` |
| `e_zhaoshangju` | `shanghai` | `pinned` |
| `e_haifang_chouyi` | `beijing` | `pinned` |
| `e_zhibuju` | `shanghai` | `pinned` |
| `e_whw_harbor` | `weihaiwei` | `city_event` |
| `e_whw_ding` | `weihaiwei` | `city_event` |
| `e_beiyang_fleet` | `weihaiwei` | `pinned` |
| `e_jp_meiji` | `japan` | `comparison` |
| `e_jp_navy` | `japan` | `comparison` |
| `e_jp_tairiku` | `japan` | `comparison` |
| `e_korea_situation` | `korea` | `city_event` |
| `e_korea_donghak` | `korea` | `pinned` |
| `e_yellow_sea_battle` | `weihaiwei` | `terminal` |
| `e_shimonoseki_treaty` | `shanghai` | `terminal` |
| `e_gz_hong` | `guangzhou` | `city_event` |
| `e_gz_humen` | `guangzhou` | `city_event` |
| `e_gz_trade` | `guangzhou` | `city_event` |
| `e_hk_rong` | `hongkong` | `city_event` |
| `e_hk_press` | `hongkong` | `city_event` |
| `e_hk_harbour` | `hongkong` | `city_event` |
| `e_wh_iron` | `wuhan` | `city_event` |
| `e_wh_river` | `wuhan` | `city_event` |
| `e_wh_zhang` | `wuhan` | `city_event` |
| `e_kp_mine` | `kaiping` | `city_event` |
| `e_kp_rail` | `kaiping` | `city_event` |
| `e_kp_fengshui` | `kaiping` | `city_event` |

## Evidence Tasks

Evidence task IDs follow `city:hotspot`.

| Evidence task ID | City |
|---|---|
| `beijing:bj-wall` | `beijing` |
| `beijing:bj-envoy` | `beijing` |
| `beijing:bj-woren` | `beijing` |
| `shanghai:sh-bund` | `shanghai` |
| `shanghai:sh-steamer` | `shanghai` |
| `shanghai:sh-workers` | `shanghai` |
| `shanghai:sh-junk` | `shanghai` |
| `shanghai:sh-stack` | `shanghai` |
| `fuzhou:fz-french` | `fuzhou` |
| `fuzhou:fz-yan` | `fuzhou` |
| `fuzhou:fz-battery` | `fuzhou` |
| `tianjin:tj-haihe` | `tianjin` |
| `tianjin:tj-advisor` | `tianjin` |
| `tianjin:tj-telegraph` | `tianjin` |
| `nanjing:nj-ruins` | `nanjing` |
| `nanjing:nj-liangjiang` | `nanjing` |
| `nanjing:nj-arsenal` | `nanjing` |
| `guangzhou:gz-hong` | `guangzhou` |
| `guangzhou:gz-humen` | `guangzhou` |
| `guangzhou:gz-trade` | `guangzhou` |
| `hongkong:hk-rong` | `hongkong` |
| `hongkong:hk-press` | `hongkong` |
| `hongkong:hk-harbour` | `hongkong` |
| `wuhan:wh-iron` | `wuhan` |
| `wuhan:wh-river` | `wuhan` |
| `wuhan:wh-zhang` | `wuhan` |
| `kaiping:kp-mine` | `kaiping` |
| `kaiping:kp-rail` | `kaiping` |
| `kaiping:kp-fengshui` | `kaiping` |

## Logging Implications

Task 7 should log against these IDs rather than visible text. Suggested payload fields:

```js
{
  route_id,
  city_id,
  event_id,
  evidence_task_id,
  hotspot_id,
  event_kind,
  constructs,
  app_version,
  research_cohort
}
```

During local development, these events remain local-only through `yangwu_research_event_queue_v1`. Supabase submission should wait until the login/session layer is agreed and the research freeze version is prepared.

## Task 9 Research Login Gate

The research login gate appears only when the URL includes `?mode=research`.

First implementation scope:

- collects only `participant_code` and `session_code`;
- stores only the limited research session object after a successful future backend login;
- keeps normal development and visual-polish work unblocked at the default URL;
- does not connect Supabase directly;
- does not submit gameplay logs.

## Task 10 Supabase Environment Setup

Task 10 prepares Supabase environment setup only. It does not connect live research data collection.

First implementation scope:

- adds `.env.example` without real values;
- adds Supabase setup checklist;
- adds pseudonymous dry-run seed SQL;
- adds `check:supabase-env`;
- keeps Supabase credentials server-side only;
- rejects `VITE_SUPABASE_*` research data writes;
- keeps `/api/login` and `/api/logs-batch` disconnected until a later approved dry-run connection sprint.

## Task 11 Supabase Dry-run Connection

Task 11 enables a controlled dry-run Supabase connection for `POST /api/login` only.

First implementation scope:

- installs `@supabase/supabase-js` for server-side API routes only;
- adds `api/_supabase.js` as the only Supabase client creation boundary;
- keeps frontend files under `src/` free of Supabase SDK imports, `createClient`, and `SUPABASE_SECRET_KEY`;
- allows login validation only when `RESEARCH_BACKEND_ENABLED=dry_run`;
- creates `game_sessions` rows only for included dry-run participants;
- returns only the limited research session object to the browser;
- keeps `POST /api/logs-batch` disconnected until a later approved logging sprint;
- keeps formal research data collection marked as not ready.

## Task 12 Live Dry-run QA / Vercel Env Setup

Task 12 prepares live dry-run QA for a Vercel Preview or local Vercel dev URL. It does not store secrets in the repository and does not enable formal research data collection.

First implementation scope:

- adds `docs/vercel-env-dryrun-setup.md`;
- adds `tests/live-dryrun-qa-check.mjs`;
- adds `check:live-dryrun`;
- documents Vercel Development / Preview / Production environment variable settings;
- tests missing code, valid dry-run participant, excluded participant, wrong session code, and logs-batch still disabled when `DRYRUN_QA_BASE_URL` is supplied;
- skips safely when no live QA URL is supplied, unless `REQUIRE_LIVE_DRYRUN_QA=true`.

## Task 13 First Real Preview Dry-run

Task 13 prepares the first real Vercel Preview dry-run checklist and result template. It does not configure secrets automatically and does not enable formal research data collection.

First implementation scope:

- adds `docs/task-13-first-preview-dryrun-guide.md`;
- adds `docs/task-13-first-preview-dryrun-results-template.md`;
- adds `tests/task13-docs-check.mjs`;
- adds `check:task13-docs`;
- records Supabase schema, seed, Vercel env, live QA, browser QA, and Supabase row checks;
- keeps `POST /api/logs-batch` disabled;
- keeps Production `RESEARCH_BACKEND_ENABLED=false`;
- keeps real student identifiers and name-to-code matching outside Supabase.

## Task 7 Active Local Events

Task 7 wires low-risk flow logging into the live game. These events are local-only and are stored in `yangwu_research_event_queue_v1`; they are not submitted to Supabase yet.

| Event type | Trigger | Research-facing payload |
|---|---|---|
| `session_start` | A new or continued route reaches the playable map | `route_id`, `is_new_game`, `year`, `season`, `constructs` |
| `city_entered` | Player enters a city scene | `route_id`, `city_id`, `year`, `season`, `travel_seasons`, `constructs` |
| `evidence_task_completed` | Player completes a city hotspot evidence task | `route_id`, `city_id`, `hotspot_id`, `evidence_task_id`, `event_id`, `task_type`, `newly_collected`, `constructs` |
| `event_opened` | Player opens a pinned, city, comparison, or terminal event | `route_id`, `city_id`, `event_id`, `event_kind`, `source`, `year`, `season`, `constructs` |
| `decision_selected` | Player selects an event choice | `route_id`, `city_id`, `event_id`, `choice_id`, `choice_index`, `choice_axis`, `has_effects`, `constructs` |
| `session_end` | Player reaches settlement | `route_id`, `year`, `season`, `completed_events_count`, `cities_visited_count`, `evidence_count`, `challenge_correct`, `constructs` |

Choice text, payoff text, student free-text responses, names, emails, phone numbers, and other directly identifying information are intentionally excluded from Task 7 logging.

## Task 15 Event Logs Supabase Dry-run

Task 15 enables server-side dry-run submission from `yangwu_research_event_queue_v1` to Supabase `event_logs`.

First implementation scope:

- keeps the frontend free of Supabase SDK imports and server secrets;
- writes logs only through `POST /api/logs-batch`;
- enables writes only when `RESEARCH_BACKEND_ENABLED=dry_run`;
- sanitizes event payloads through a server-side allowlist;
- submits queued events only after a valid limited research session exists;
- clears the local queue only after a successful accepted response;
- keeps queued events for retry when the backend is unavailable;
- still excludes visible choice prose, student free text, names, contact details, and name-to-code linkage.

Task 15 supports dry-run validation. It does not by itself mean formal research data collection is ready.

## Task 16 Research Dataset QA

Task 16 adds the first research-facing dataset QA layer.

First implementation scope:

- adds `docs/research-data-dictionary.md`;
- adds `docs/supabase-research-qa-queries.sql`;
- adds `docs/task-16-research-dataset-qa.md`;
- adds `check:research-data`;
- emits `complexity_dimensions` from gameplay instrumentation;
- keeps interpretation guardrails clear: event logs show engagement/exposure patterns, not direct proof of learning outcomes.

Task 16 supports dry-run and pilot validation. It does not by itself mean formal research data collection is ready.

## Task 17 Researcher Export / Dashboard Planning

Task 17 converts the Task 16 data dictionary into a researcher-facing export and dashboard plan.

First implementation scope:

- adds `docs/researcher-export-dashboard-plan.md`;
- adds `docs/supabase-research-export-queries.sql`;
- adds `docs/task-17-researcher-export-dashboard-planning.md`;
- adds `check:research-export`;
- defines export packages for session summary, event-log long data, complexity exposure, and assessment scores;
- defines private researcher dashboard sections, KPI cards, charts, filters, tables, export readiness rules, and interpretation guardrails.

Task 17 is a planning/export layer. It does not create a public dashboard and does not make formal research data collection ready.

## Task 18 Supabase Export Implementation / Researcher CSV Export QA

Task 18 turns the Task 17 export plan into an applied researcher export workflow.

First implementation scope:

- updates `docs/supabase-research-export-queries.sql` for Supabase view implementation;
- adds `docs/task-18-supabase-export-implementation-qa.md`;
- adds `docs/researcher-csv-export-manifest.md`;
- adds `scripts/research-csv-export-qa.mjs`;
- adds `check:research-export-implementation`;
- adds `check:research-csv-export`;
- defines expected researcher CSV filenames and required columns;
- checks that `live_dryrun_qa` rows, privacy exception rows, non-included consent rows, and disallowed identity columns are not present in analysis exports.

Task 18 supports dry-run and pilot export QA. It does not by itself mean formal research data collection is ready.

## Task 19 Pilot Data Capture / First Real Research Dry-run

Task 19 defines the first end-to-end pilot data capture rehearsal.

First implementation scope:

- adds `docs/task-19-pilot-data-capture-dry-run.md`;
- adds `docs/task-19-pilot-dryrun-results-template.md`;
- adds `tests/task19-pilot-dryrun-check.mjs`;
- adds `check:pilot-dryrun`;
- uses `?mode=research` with dry-run participant codes `YW-001` and `YW-002`;
- expects gameplay coverage for `session_start`, `city_entered`, `evidence_task_completed`, `event_opened`, `decision_selected`, and, where feasible, `session_end`;
- requires Supabase row QA and six-file CSV re-export after the browser run;
- keeps RQ1, RQ2, and RQ3 interpretation boundaries explicit;
- keeps real students, personal identifiers, and name-to-code matching outside the dry-run.

Task 19 validates the data-capture cycle. It does not by itself mean formal research data collection is ready.

## Task 20 Student Pilot Readiness / Research Freeze Gate

Task 20 turns the working dry-run pipeline into a student-pilot readiness gate.

First implementation scope:

- adds `docs/task-20-student-pilot-readiness-gate.md`;
- adds `docs/task-20-student-pilot-readiness-signoff-template.md`;
- adds `tests/task20-student-pilot-readiness-check.mjs`;
- adds `check:student-pilot-readiness`;
- checks research and ethics readiness before real student use;
- checks `APP_VERSION`, `RESEARCH_COHORT`, and `content_map_version` as pilot freeze markers;
- checks that stable research IDs are not casually renamed during the pilot;
- checks login, Supabase `game_sessions`, Supabase `event_logs`, export views, CSV QA, and privacy exception readiness;
- checks iPad, phone, desktop/laptop, school network, and backup instruction readiness;
- requires a decision of `approved for limited pilot`, `approved with conditions`, or `not approved`.

Task 20 is a governance and readiness layer. It does not create new gameplay features, approve formal research collection automatically, or permit deployment beyond the agreed school and research context.

## Task 20.2 Pilot APP_VERSION Freeze / Final Rehearsal Prep

Task 20.2 freezes the app version marker for the LKKC pilot cycle.

First implementation scope:

- sets `APP_VERSION` to `lkkc-pilot-v1.0`;
- keeps `RESEARCH_COHORT` as `lkkc-may-june-2026`;
- keeps `content_map_version` as `content-freeze-lite-v0.1`;
- updates app code, server fallback defaults, `.env.example`, active QA tests, CSV fixtures, and research-facing baseline docs;
- adds `docs/task-20-2-pilot-version-freeze-final-rehearsal-prep.md`;
- adds `tests/task20-2-pilot-version-freeze-check.mjs`;
- adds `check:pilot-version-freeze`;
- requires Vercel env update, redeployment, Supabase row verification, privacy QA, and CSV re-export before real student use.

Task 20.2 fixes the versioning layer only. It does not replace device QA, consent confirmation, classroom runbook preparation, real participant/session code setup, or final student-pilot sign-off.

## Task 20.3 Vercel Redeploy / Live Row Verification

Task 20.3 verifies that the deployed Vercel app and Supabase rows use the frozen pilot app version.

First implementation result:

- Vercel was redeployed after `APP_VERSION` was updated to `lkkc-pilot-v1.0`;
- `npm run check:live-dryrun` passed against the production deployment;
- production `/api/login` returned a valid `YW-001` dry-run session with `app_version = 'lkkc-pilot-v1.0'`;
- researcher confirmed latest Supabase `game_sessions` and `event_logs` rows show `app_version = 'lkkc-pilot-v1.0'`;
- `research_cohort` remains `lkkc-may-june-2026`;
- `content_map_version` remains `content-freeze-lite-v0.1`.

Task 20.3 clears the pilot-version deployment gate. It does not clear device QA, school network QA, real participant/session code preparation, consent confirmation, classroom runbook, privacy QA re-export, or final student-pilot sign-off.

## Task 21 Teacher / Classroom Pilot Runbook

Task 21 prepares the classroom-facing operational runbook for a limited student pilot.

First implementation scope:

- adds `docs/task-21-teacher-classroom-pilot-runbook.md`;
- adds `tests/task21-classroom-runbook-check.mjs`;
- adds `check:classroom-runbook`;
- documents teacher, researcher, student, and technical-helper roles;
- documents pre-lesson research, technical, device, and school-network checks;
- provides student-facing board instructions in English and Chinese;
- provides a teacher opening script in English and Chinese;
- defines classroom timing, support rules, fallback actions, and stop conditions;
- defines post-lesson Supabase row checks, privacy QA, CSV export, and field-note procedure.

Task 21 closes the classroom-procedure planning gap. It does not clear final iPad/phone/school-network QA, real participant/session code preparation, consent confirmation, privacy QA re-export, CSV export QA, or final student-pilot sign-off.

## Task 22 Device / School Network QA

Task 22 prepares the formal device and school-network QA gate before a limited student pilot.

First implementation scope:

- adds `docs/task-22-device-school-network-qa.md`;
- adds `docs/task-22-device-school-network-qa-results-template.md`;
- adds `tests/task22-device-network-qa-check.mjs`;
- adds `check:device-network-qa`;
- defines minimum desktop/laptop, iPad, phone, school Wi-Fi, and hotspot-fallback checks;
- defines login, city, evidence task, event, decision, journal, event-modal, and map-label checks;
- defines Supabase row verification for `lkkc-pilot-v1.0`, `lkkc-may-june-2026`, and `content-freeze-lite-v0.1`;
- defines privacy QA through `research_privacy_exception_export`;
- defines pass, partial, and fail criteria for device/network readiness.

Task 22 clears the device/network QA gate only after the results template is completed and reviewed. It does not clear real participant/session code preparation, consent confirmation, final CSV export QA, or final student-pilot sign-off.

## Task 23 More Event Coverage

Task 23 reviews whether the research logger should capture additional low-risk gameplay events beyond the current core flow.

First implementation scope:

- adds `docs/task-23-more-event-coverage-plan.md`;
- adds `tests/task23-more-event-coverage-plan-check.mjs`;
- adds `check:more-event-coverage-plan`;
- documents current active events: `session_start`, `city_entered`, `evidence_task_completed`, `event_opened`, `decision_selected`, and `session_end`;
- recommends `source_opened` and `checkpoint_submitted` as the first additional events;
- conditionally recommends `journal_opened` for navigation/support and mobile QA interpretation;
- defers `technical_recovery` until device/network QA shows whether technical disruption is common;
- keeps the privacy boundary explicit: no visible prose, free-text answers, real names, student IDs, contact details, or name-to-code data.

Task 23 is a design and approval gate. It does not implement new event logging until the recommended coverage set is approved.

## Task 23A Source And Checkpoint Event Coverage

Task 23A implements the approved minimal event coverage expansion.

First implementation scope:

- adds `source_opened` when an evidence/hotspot task opens;
- adds `checkpoint_submitted` when an event challenge or facility study challenge is submitted;
- adds instrumentation helpers for both events;
- expands the server allowlist only for controlled fields such as `checkpoint_type`, `checkpoint_correct`, `attempt_index`, and `task_type`;
- adds explicit researcher export columns for `source`, `task_type`, `checkpoint_type`, `checkpoint_correct`, and `attempt_index`;
- updates CSV manifest, CSV QA, fixtures, and tests;
- keeps visible prompt text, option labels, written responses, names, student IDs, emails, phones, and name-to-code data out of event logs.

Task 23A improves RQ2 process coverage. It does not implement `journal_opened` or `technical_recovery`, and it does not change RQ1 outcome scoring.

## Task 24 Pilot Export Package / Research Data Handoff

Task 24 records the first complete dry-run researcher export package after Task 23B.

First implementation scope:

- adds `docs/task-24-pilot-export-package-handoff.md`;
- adds `tests/task24-pilot-export-handoff-check.mjs`;
- adds `check:pilot-export-handoff`;
- records the export folder `exports/task23b-2026-06-15`;
- records the six researcher CSV files and QA row counts;
- confirms `dataset_event_log_long.csv` includes Task 23A columns: `source`, `task_type`, `checkpoint_type`, `checkpoint_correct`, and `attempt_index`;
- confirms `dataset_assessment_scores.csv` and `dataset_privacy_exceptions.csv` have 0 data rows in this dry-run package;
- keeps the package classified as dry-run QA data, not formal student data;
- keeps the name-to-code mapping outside Supabase and outside export files.

Task 24 closes the export-pipeline rehearsal for the dry-run path. It does not approve formal research analysis, replace HEA/HNET/Transfer Task/PAQ scoring, replace focus group evidence, or clear Task 22 device and school-network QA.

## Task 25 Front-End UI Evidence / Checkpoint Dry-Run

Task 25 tests whether the Task 23A event coverage can be generated from the production UI rather than API-only insertion.

Dry-run scope:

- uses `https://yangwu-research-simulation-app.vercel.app/?mode=research`;
- uses `YW-001` and `LKKC-2026-DRYRUN`;
- uses `lkkc-pilot-v1.0`, `lkkc-may-june-2026`, and `content-freeze-lite-v0.1`;
- confirms that opening the Beijing `bj-wall` hotspot evidence task sends `source_opened`;
- confirms that submitting the Beijing `bj-zongli` facility challenge sends `checkpoint_submitted`;
- confirms the production API can return `200` with `inserted_count = 1` for a UI-generated log batch;
- records a deployment-environment finding: the checked Supabase project `yangwu-research-lkkc-2026` returned `0 row` for the Task 25 session in `research_event_log_long_export` and raw `event_logs`.

Task 26 supersedes the initial Task 25 export-visibility concern. Clean SQL verification confirmed that the Task 25 `source_opened` and `checkpoint_submitted` rows are visible in `research_event_log_long_export`. The initial `0 row` finding was caused by stale SQL content remaining in the Supabase SQL Editor, not by a Vercel / Supabase environment mismatch.

## Task 26 Vercel / Supabase Environment Alignment

Task 26 investigates and resolves the apparent Vercel / Supabase mismatch from Task 25.

First implementation scope:

- adds `api/research-env-diagnostic.js`;
- adds `tests/task26-env-diagnostic-check.mjs`;
- adds `check:env-alignment`;
- confirms Vercel Production metadata points to Supabase project ref `zjmuydbuskxouqlkcspy`;
- confirms `RESEARCH_BACKEND_ENABLED = dry_run`, `SUPABASE_SCHEMA = public`, `APP_VERSION = lkkc-pilot-v1.0`, and `RESEARCH_COHORT = lkkc-may-june-2026`;
- confirms a fresh production login writes a visible `game_sessions` row;
- confirms Task 25 `source_opened` and `checkpoint_submitted` rows are visible in `research_event_log_long_export`;
- records the corrected SQL Editor QA method: full select, delete, paste, run, and check for syntax-error notifications before trusting row counts.

Task 26 clears the production data-path alignment gate for dry-run QA. It does not clear Task 22 device/school-network QA or formal student data collection. The temporary diagnostic endpoint should be removed or protected before formal public deployment.
