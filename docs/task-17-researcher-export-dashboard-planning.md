# Task 17 Researcher Export / Dashboard Planning

Status: implemented as planning/export layer  
Formal research data collection status: not ready for formal research data collection

## Purpose

Task 17 turns the Task 16 data dictionary into a practical researcher export and dashboard plan. It does not create a public dashboard and does not expose student-level data to teachers or students.

## Source Basis

- `docs/research-data-dictionary.md`
- `docs/supabase-research-qa-queries.sql`
- `docs/supabase-schema-v1.sql`
- Current dry-run Supabase event-log design

## Implemented Outputs

- `docs/researcher-export-dashboard-plan.md`
- `docs/supabase-research-export-queries.sql`
- `docs/task-17-researcher-export-dashboard-planning.md`
- `check:research-export`

## Dashboard Brief

Audience: researcher and project owner.

Primary decisions supported:

- whether the data pipeline is healthy enough for a pilot;
- whether a participant/session has sufficient exposure for analysis;
- which process indicators can support RQ2;
- which participants may be useful for focus group sampling under RQ3.

Not supported:

- student ranking;
- teacher performance evaluation;
- direct claims about learning outcomes without HEA/HNET/Transfer/PAQ scores;
- live classroom surveillance.

## Default View

The dashboard should open with a compact cohort-level monitoring view:

- participants with sessions;
- valid gameplay sessions;
- completed sessions;
- participants/sessions with evidence-task engagement;
- median historical complexity dimension exposure;
- non-technological exposure coverage;
- latest event timestamp;
- privacy exception count.

## Filters

Use a small number of high-value global filters:

- `research_cohort`
- `app_version`
- `content_map_version`
- `condition`
- `class_id`
- date range
- include/exclude dry-run QA events

Do not include filters based on real names, student IDs, email, phone, or name-to-code mappings.

## KPI cards

Recommended first KPI cards:

1. Included participants with at least one valid session.
2. Completed intervention sessions.
3. Evidence tasks completed per session.
4. Median `distinct_complexity_dimensions_encountered`.
5. Sessions with `institutional_political_financial_exposure`.
6. Privacy exceptions.

## Charts

Recommended first charts:

- event type coverage bar chart;
- historical complexity dimension exposure bar chart;
- evidence tasks completed by condition;
- evidence-before-decision ratio distribution;
- session completion by device category.

## Tables

Recommended first tables:

- participant/session summary;
- low-exposure or incomplete sessions;
- event-log long table for researcher audit;
- privacy exception table;
- assessment score readiness table.

## Export Readiness

Before exporting for analysis:

- run Task 16 QA queries;
- confirm `research_privacy_exception_export` is empty;
- exclude `live_dryrun_qa`;
- confirm consent status is `included`;
- confirm app/content versions;
- document excluded sessions and reasons;
- keep the name-to-code list outside Supabase.

## Interpretation Guardrails

- Event logs describe behaviour and exposure, not understanding by themselves.
- Complexity dimensions are opportunities to encounter multi-causal explanations, not proof of mastery.
- RQ1 requires scored HEA, HNET, Transfer Task, and PAQ evidence.
- RQ2 can use process logs directly if phrased as engagement/exposure.
- RQ3 requires focus group or perception evidence; process logs only contextualise sampling and interpretation.

## Next Implementation Candidate

Task 18 can choose one of two routes:

1. Supabase export implementation: apply the SQL views, run QA, and export CSVs.
2. Researcher dashboard prototype: build a private researcher dashboard using the export views after enough real gameplay rows exist.
