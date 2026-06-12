# Research ID Map / Content Freeze Lite

Version: `content-freeze-lite-v0.1`  
App baseline: `dev-v0.1`  
Logger queue: `yangwu_research_event_queue_v1`  
Updated: 2026-06-10

## Purpose

This document defines the stable research-facing IDs used by the Self-Strengthening Movement simulation. It supports later logging, Supabase export, and research analysis without preventing continued game design work.

Content Freeze Lite freezes IDs only. It does not freeze wording, images, layout, or visual polish. Event prose, illustrations, modal design, mobile layout, interaction feel, and teaching language may continue to improve as long as the stable IDs below are not casually renamed.

## Current Coverage

- Routes: 4
- Cities: 12
- Events: 52
- Evidence tasks: 29

The executable source of truth is `src/research/content-map.js`. This document is the human-readable companion for research discussion, teacher review, and future backend planning.

## ID Policy

| Area | Stable ID rule | Can still change |
|---|---|---|
| Route | Keep route keys such as `lihongzhang`, `yixin`, `rongheng`, `free` | Character wording, portrait treatment, route introduction |
| City | Keep city keys such as `beijing`, `shanghai`, `fuzhou` | City artwork, tagline, layout, tooltip copy |
| Event | Keep event IDs such as `e_zongli_yamen` and `e_yellow_sea_battle` | Event prose, choice wording, result style |
| Evidence task | Keep `city:hotspot` IDs such as `beijing:bj-wall` | Task instruction wording, reveal flow, visual design |
| Research construct | Keep construct labels in `RESEARCH_CONSTRUCTS` | Interpretation notes and later coding refinements |

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
