# Task 16 Research Dataset QA

Status: implemented for dry-run validation  
Formal research data collection status: not ready

## Purpose

Task 16 checks whether the data created by the login and event-log pipeline can support the research design, not merely whether rows can be inserted.

The key standard is: every collected field should either support a research question, support implementation fidelity, or protect data quality. Fields that do not meet that standard should not be collected.

## Implemented Outputs

- `docs/research-data-dictionary.md` defines tables, fields, event types, complexity dimensions, derived indicators, RQ alignment, and interpretation guardrails.
- `docs/supabase-research-qa-queries.sql` provides read-only Supabase Row QA queries for dry-run and pilot checks.
- `check:research-data` verifies that the data dictionary, QA SQL, complexity dimensions, and privacy guardrails remain present.
- `complexity_dimensions` are now emitted by the gameplay instrumentation so `event_logs` can support historical complexity analysis.

## Supabase Row QA

After a live dry-run, run the QA SQL in Supabase and check:

- `event_logs` rows link to valid `game_sessions`;
- event participant code matches session participant code;
- event logs belong only to included participants for analysis;
- payload does not contain `choice_label`, `response_text`, `name_to_code`, `student_id`, `email`, or `phone`;
- `app_version`, `research_cohort`, and `content_map_version` are populated consistently;
- `complexity_dimensions` are present for real gameplay events;
- dry-run test rows such as `live_dryrun_qa` are excluded from formal analysis exports.

## Research Interpretation

For RQ1, gameplay logs should only support exposure/fidelity interpretation. Outcome claims require HEA, HNET, Transfer Task, PAQ, and scored written evidence.

For RQ2, event logs can directly support process claims such as evidence-task engagement, route breadth, decision timing, and multi-causal exposure.

For RQ3, event logs should contextualise focus group sampling and interpretation, not replace perception or interview data.

## Current Guardrails

- Pseudonymous participant codes only.
- Name-to-code list remains outside Supabase.
- Gameplay logs store stable IDs and controlled labels, not visible prose.
- Free-text analysis belongs in approved assessment/checkpoint tables, not low-risk event logs.
- Formal research collection remains blocked until consent, withdrawal, app/content freeze, and export/deletion procedures are confirmed.

## Next Candidate Task

Task 17 should convert this dataset QA layer into a first researcher-facing export plan or dashboard plan, using the data dictionary as the source of truth.
