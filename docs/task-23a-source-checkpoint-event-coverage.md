# Task 23A Source And Checkpoint Event Coverage

Status: implemented locally; deployment and live row QA still required  
Formal research data collection status: not approved until deployment, Supabase row verification, privacy QA, and CSV export QA are complete

## Purpose

Task 23A implements the approved minimal event coverage expansion from Task 23:

- `source_opened`
- `checkpoint_submitted`

It does not implement `journal_opened` or `technical_recovery`.

## Implemented Events

### `source_opened`

Trigger:

- fired when an evidence/hotspot task modal opens.

Safe payload:

- `route_id`
- `city_id`
- `event_id`, if the hotspot unlocks a mapped event
- `event_kind`, when resolvable through the content map
- `evidence_task_id`
- `hotspot_id`
- `task_type`
- `source = 'hotspot'`
- `year`
- `season`
- `constructs`
- `complexity_dimensions`
- `research_id_policy`

Research use:

- distinguishes evidence/source exposure attempts from evidence-task completion.

### `checkpoint_submitted`

Trigger:

- fired when a student submits an event challenge / 幕僚追問;
- fired when a student submits a facility study challenge.

Safe payload:

- `route_id`
- `city_id`
- `event_id`, for event challenges only
- `event_kind`, when resolvable through the content map
- `checkpoint_type`, such as `event_challenge` or `facility_challenge`
- `choice_axis`
- `checkpoint_correct`
- `attempt_index`
- `year`
- `season`
- `constructs`
- `complexity_dimensions`
- `research_id_policy`

Research use:

- captures in-game reasoning checkpoint attempts as process data.
- does not replace HEA, HNET, Transfer Task, PAQ, or scored assessment data.

## Privacy Boundary

Task 23A does not log:

- visible prompt text;
- visible option labels;
- student written responses;
- names;
- student IDs;
- emails;
- phone numbers;
- name-to-code mapping;
- teacher notes.

The server-side allowlist was expanded only for controlled fields such as `checkpoint_type`, `checkpoint_correct`, `attempt_index`, and `task_type`.

## Export Impact

`research_event_log_long_export` now exposes these additional columns:

- `source`
- `task_type`
- `checkpoint_type`
- `checkpoint_correct`
- `attempt_index`

The CSV manifest and CSV QA script expect these columns in `dataset_event_log_long.csv`.

## Required Post-Deployment QA

After deployment:

1. Open `https://yangwu-research-simulation-app.vercel.app/?mode=research`.
2. Log in with `YW-001` and `LKKC-2026-DRYRUN`.
3. Open one evidence task but do not immediately complete it.
4. Confirm `event_logs` contains `source_opened`.
5. Complete one event or facility challenge.
6. Confirm `event_logs` contains `checkpoint_submitted`.
7. Confirm both event types use `app_version = 'lkkc-pilot-v1.0'`.
8. Run privacy QA and confirm zero rows.
9. Re-apply export SQL if needed.
10. Export CSVs and run `npm run check:research-csv-export -- /path/to/export-folder`.

## Interpretation Boundary

`source_opened` and `checkpoint_submitted` are process indicators. They show exposure, navigation, and response opportunities. They do not prove learning gains without written/scored outcomes and qualitative interpretation.
