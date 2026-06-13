# Researcher Export / Dashboard Plan

Version: `task-17-export-dashboard-v0.1`  
Source of truth: `docs/research-data-dictionary.md`  
Formal research data collection status: not ready for formal research data collection

## Purpose

This plan defines the first researcher-facing export and dashboard layer for the Yangwu historical simulation study. It is designed for research monitoring, data QA, and later analysis preparation. It is not a teacher-facing class dashboard and not a student-facing interface.

The dashboard should help the researcher answer three practical questions:

1. Are the login, session, and event-log pipelines working as expected?
2. Is each participant's gameplay exposure sufficient and interpretable?
3. Which process indicators can later be triangulated with HEA, HNET, Transfer Task, PAQ, and focus group data?

## Research Question Alignment

| Research question | Dashboard role | Export role |
|---|---|---|
| RQ1 | Shows whether participants had sufficient intervention exposure before outcome scores are interpreted. | Joins session/exposure flags with assessment and rubric score tables. |
| RQ2 | Shows evidence-task engagement, decision timing, route breadth, and historical complexity exposure. | Exports raw event logs and derived process indicators for analysis. |
| RQ3 | Supports focus group sampling and interpretation by identifying high/low completion and varied engagement patterns. | Exports pseudonymous process summaries only; focus group notes remain separately controlled. |

## Researcher Export Packages

### `dataset_session_summary`

Grain: one row per `participant_code` and `session_id`.

Use:

- check whether each participant logged in;
- check device and version consistency;
- identify incomplete or duplicate sessions;
- support `completed_intervention_session` filtering.

Core fields:

- `participant_code`
- `session_id`
- `class_id`
- `condition`
- `consent_status`
- `app_version`
- `research_cohort`
- `content_map_version`
- `device_category`
- `viewport_width`
- `viewport_height`
- `browser_family`
- `started_at`
- `ended_at`
- `completion_status`
- `event_count`
- `first_event_time`
- `last_event_time`
- `completed_intervention_session`

### `dataset_event_log_long`

Grain: one row per event log.

Use:

- reconstruct gameplay sequence;
- audit event type coverage;
- inspect route/city/event/evidence IDs;
- preserve raw process trace for RQ2.

Core fields:

- `participant_code`
- `session_id`
- `event_type`
- `client_time`
- `server_time`
- `route_id`
- `city_id`
- `event_id`
- `event_kind`
- `evidence_task_id`
- `hotspot_id`
- `choice_id`
- `choice_index`
- `choice_axis`
- `constructs`
- `complexity_dimensions`
- `app_version`
- `research_cohort`
- `content_map_version`

Export rule: exclude live_dryrun_qa from formal analysis exports.

### `dataset_complexity_exposure`

Grain: one row per `participant_code` and `session_id`.

Use:

- summarise exposure to multi-causal historical complexity;
- support RQ2 process analysis;
- contextualise Transfer Task and HNET interpretation.

Core indicators:

- `distinct_complexity_dimensions_encountered`
- `dimensions_encountered`
- `evidence_tasks_completed_total`
- `decision_count`
- `decisions_after_evidence`
- `evidence_before_decision_ratio`
- `japan_comparison_exposure`
- `institutional_political_financial_exposure`
- `completed_intervention_session`

Interpretation guardrail: these indicators show exposure and engagement opportunities, not direct mastery.

### `dataset_assessment_scores`

Grain: one row per participant, instrument, phase, and scoring dimension.

Use:

- support RQ1 outcome analysis;
- connect HEA/HNET/Transfer/PAQ scoring to intervention condition;
- compare process indicators with scored written outcomes.

Core fields:

- `participant_code`
- `class_id`
- `condition`
- `instrument`
- `phase`
- `dimension`
- `score`
- `rubric_version`
- `coder_id`
- `instrument_version`
- `response_id`

This dataset depends on approved scoring workflows and should not be treated as complete during the current dry-run stage.

## Dashboard Brief

Audience: researcher and project owner.

Cadence:

- dry-run: after each technical test;
- classroom pilot: immediately after each class session;
- formal study: after each intervention run and before analysis export.

Primary use:

- data quality monitoring;
- intervention exposure/fidelity checking;
- early research analysis preparation;
- focus group sampling support.

Not intended for:

- ranking students;
- live classroom surveillance;
- teacher performance evaluation;
- replacing coded HEA/HNET/Transfer/PAQ evidence.

## Dashboard Default View

### Header

- cohort filter and app/content version filter;
- latest event server time;
- formal collection readiness status;
- warning if dry-run/test rows are included.

### KPI cards

1. Included participants with at least one session.
2. Total valid gameplay sessions.
3. Sessions with `completed_intervention_session = 1`.
4. Participants with at least one evidence task.
5. Median `distinct_complexity_dimensions_encountered`.
6. Participants with non-technological exposure (`institutional_political_financial_exposure > 0`).

### Charts

| Chart | Purpose |
|---|---|
| Event type coverage bar chart | Confirms whether expected event types are being captured. |
| Complexity dimension exposure bar chart | Shows whether gameplay creates multi-causal exposure beyond technology. |
| Evidence tasks completed by condition | Compares process engagement cautiously across conditions. |
| Evidence-before-decision ratio distribution | Identifies whether students make decisions after evidence exposure. |
| Session completion by device category | Flags iPad/mobile usability or completion issues. |

### Tables

| Table | Purpose |
|---|---|
| Participant session summary | Main researcher lookup table for session QA. |
| Incomplete/low-exposure sessions | Identifies sessions needing exclusion or interpretation caution. |
| Privacy QA exceptions | Should normally be empty; flags disallowed payload fields. |
| Assessment readiness table | Shows whether outcome instruments and scores are available for RQ1. |

## Filters

Global filters:

- `research_cohort`
- `app_version`
- `content_map_version`
- `condition`
- `class_id`
- date range based on `server_time` or `started_at`
- include/exclude dry-run QA events

Avoid filters that expose or imply real student identity.

## Export Readiness Rules

Before exporting for analysis:

- confirm `participants.consent_status = 'included'`;
- exclude `live_dryrun_qa`;
- confirm app/content version consistency;
- run privacy QA and resolve any non-empty result;
- keep name-to-code matching outside Supabase;
- document any excluded sessions and reasons;
- record export notes in `export_batches`.

## Interpretation Guardrails

- Event logs measure engagement/exposure, not learning outcomes.
- Complexity dimensions measure opportunity to encounter multi-causal material, not mastery.
- RQ1 requires scored assessment evidence.
- RQ2 can use event logs directly, but language should remain "engaged with", "encountered", or "was exposed to".
- RQ3 requires focus group/perception data; process logs only contextualise sampling and interpretation.

## Recommended Build Sequence

1. Use `docs/supabase-research-export-queries.sql` to create validated export queries/views.
2. Manually inspect outputs in Supabase Table Editor or SQL result grid.
3. Export CSVs for first dry-run review.
4. Build a simple researcher dashboard only after two or more real sessions exist.
5. Keep dashboard private to the researcher until formal data handling is approved.
