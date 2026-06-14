# Researcher CSV Export Manifest

Version: `task-18-csv-export-v0.1`  
Source of truth: `docs/supabase-research-export-queries.sql`  
Formal research data collection status: not ready for formal research data collection

## Export Package

Export these Supabase views as CSV files with the filenames below.

| CSV file | Supabase view | Grain | Use |
|---|---|---|---|
| `dataset_session_summary.csv` | `research_session_summary_export` | One row per participant/session | Session QA, device/version checks, completion and exposure filtering. |
| `dataset_event_log_long.csv` | `research_event_log_long_export` | One row per valid event log | RQ2 process trace, event coverage, route/city/event/evidence ID audit. |
| `dataset_complexity_exposure.csv` | `research_complexity_exposure_export` | One row per participant/session | Complexity exposure and process indicators. |
| `dataset_assessment_scores.csv` | `research_assessment_scores_export` | One row per participant/instrument/phase/dimension | RQ1 scored outcome analysis when approved scores exist. |
| `dataset_dashboard_overview.csv` | `research_dashboard_overview_export` | One row per cohort/version/condition | Researcher monitoring and dashboard seed data. |
| `dataset_privacy_exceptions.csv` | `research_privacy_exception_export` | One row per privacy exception | Export readiness QA; should normally contain headers only. |

## Required Columns

### `dataset_session_summary.csv`

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

### `dataset_event_log_long.csv`

- `participant_code`
- `session_id`
- `class_id`
- `condition`
- `event_type`
- `client_time`
- `server_time`
- `route_id`
- `city_id`
- `event_id`
- `event_kind`
- `source`
- `evidence_task_id`
- `hotspot_id`
- `task_type`
- `choice_id`
- `choice_index`
- `choice_axis`
- `checkpoint_type`
- `checkpoint_correct`
- `attempt_index`
- `constructs`
- `complexity_dimensions`
- `app_version`
- `research_cohort`
- `content_map_version`

### `dataset_complexity_exposure.csv`

- `participant_code`
- `session_id`
- `class_id`
- `condition`
- `distinct_complexity_dimensions_encountered`
- `dimensions_encountered`
- `evidence_tasks_completed_total`
- `decision_count`
- `decisions_after_evidence`
- `evidence_before_decision_ratio`
- `japan_comparison_exposure`
- `institutional_political_financial_exposure`
- `completed_intervention_session`

### `dataset_assessment_scores.csv`

- `participant_code`
- `class_id`
- `condition`
- `session_id`
- `instrument`
- `phase`
- `instrument_version`
- `dimension`
- `score`
- `rubric_version`
- `coder_id`
- `response_id`
- `coded_at`

### `dataset_dashboard_overview.csv`

- `research_cohort`
- `app_version`
- `content_map_version`
- `condition`
- `participants_with_sessions`
- `session_count`
- `completed_session_count`
- `avg_distinct_complexity_dimensions_encountered`
- `median_distinct_complexity_dimensions_encountered`
- `avg_evidence_tasks_completed_total`
- `avg_evidence_before_decision_ratio`
- `participants_or_sessions_with_japan_comparison_exposure`
- `participants_or_sessions_with_institutional_political_financial_exposure`

### `dataset_privacy_exceptions.csv`

- `log_id`
- `participant_code`
- `session_id`
- `event_type`
- `payload`

This file should normally contain no data rows. A non-empty privacy exception export blocks analysis export readiness.

## Export Readiness

The package is ready for dry-run analysis only when:

- required files exist;
- required columns are present;
- event export contains no `live_dryrun_qa`;
- participant/session exports use pseudonymous `participant_code`;
- formal analysis excludes non-included consent statuses;
- privacy exception export is empty;
- no exported column contains real name, student ID, email, phone, or name-to-code matching fields.

The package is not ready for formal research analysis until the ethics-approved data collection, instrument scoring, and export audit workflow are confirmed.
