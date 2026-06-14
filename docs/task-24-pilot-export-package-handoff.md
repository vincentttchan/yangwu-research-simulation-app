# Task 24 Pilot Export Package / Research Data Handoff

Status: dry-run export package prepared and QA passed  
Export date: 2026-06-15  
Export folder: `exports/task23b-2026-06-15`  
Formal research data collection status: not formal student data

## Purpose

Task 24 turns the Task 23B dry-run export into a traceable research data handoff package. The package is useful for checking the export workflow, the semantic layer, dashboard readiness, and the relationship between event logs and the research questions.

This package is dry-run QA data. It must not be treated as formal student data, learning outcome evidence, or an approved analysis dataset.

## Package Contents

| CSV file | Source view | QA row count | Primary use |
|---|---|---:|---|
| `dataset_session_summary.csv` | `research_session_summary_export` | 16 data rows | Session QA, version/device checks, completion/exposure filtering. |
| `dataset_event_log_long.csv` | `research_event_log_long_export` | 17 data rows | RQ2 process trace, event coverage, route/city/event/evidence audit. |
| `dataset_complexity_exposure.csv` | `research_complexity_exposure_export` | 16 data rows | Historical-complexity exposure and process indicators. |
| `dataset_assessment_scores.csv` | `research_assessment_scores_export` | 0 data rows | Future RQ1 scored outcome analysis after approved HEA, HNET, Transfer Task, and PAQ coding. |
| `dataset_dashboard_overview.csv` | `research_dashboard_overview_export` | 2 data rows | Researcher monitoring and dashboard seed data. |
| `dataset_privacy_exceptions.csv` | `research_privacy_exception_export` | 0 data rows | Privacy QA; should normally remain header-only. |

## QA Commands

CSV package QA passed:

```bash
npm run check:research-csv-export -- exports/task23b-2026-06-15
```

Task 24 handoff QA:

```bash
npm run check:pilot-export-handoff
```

## Task 23A Columns In Event Export

`dataset_event_log_long.csv` includes the Task 23A columns appended after the original event-log export columns:

- `source`
- `task_type`
- `checkpoint_type`
- `checkpoint_correct`
- `attempt_index`

These fields support low-risk RQ2 process analysis, especially whether students opened sources and submitted scaffolded checkpoints. They are process indicators only. They do not prove evidence use quality, historical empathy, argumentation quality, or historical understanding.

## Privacy And Data-Minimisation Boundary

The export package should not include:

- real names;
- student IDs;
- email addresses;
- phone numbers;
- school account identifiers;
- name-to-code mapping;
- raw written responses;
- visible choice prose;
- teacher notes.

The name-to-code list must remain outside Supabase and outside this export package.

Privacy QA status:

- `research_privacy_exception_export` returned 0 data rows.
- `dataset_privacy_exceptions.csv` contains 0 data rows.

## Research Interpretation Boundary

This package can support dry-run checks for:

- whether production login and event logging are functioning;
- whether the Supabase export views are correctly applied;
- whether event coverage now includes `source_opened` and `checkpoint_submitted`;
- whether the CSV manifest and QA script work;
- whether process indicators can be read without exposing personal data.

This package cannot support formal claims about:

- learning gains;
- evidence-use quality;
- historical empathy;
- historical narrative quality;
- Transfer Task argumentation;
- PAQ-coded reasoning quality;
- focus group themes.

Formal RQ1 and RQ3 interpretation still requires ethics-approved student data, coded HEA, HNET, Transfer Task, PAQ, perception/focus group data, and the agreed analysis workflow.

## Open Items Before Student Pilot

- Complete one front-end UI evidence/checkpoint dry-run if possible, not only API-level event insertion.
- Complete and review Task 22 device / school-network QA results.
- Confirm real participant codes and session codes are prepared.
- Keep name-to-code matching securely outside Supabase and outside exports.
- Confirm consent workflow before any real student data collection.
- Re-export CSVs after any new pilot run.
- Keep dry-run QA data clearly separated from formal student data.

## Handoff Decision

Task 24 is ready as a dry-run handoff package. It closes the current export-pipeline rehearsal, but it does not approve formal research analysis or classroom data collection.

Recommended next step:

- Task 25: Front-End UI Evidence / Checkpoint Dry-Run, using `YW-001` and `LKKC-2026-DRYRUN`, to verify that real user interactions generate `source_opened` and `checkpoint_submitted` without relying on API-only insertion.
