# Task 18 Supabase Export Implementation / Researcher CSV Export QA

Status: implementation and local QA layer prepared  
Formal research data collection status: not ready for formal research data collection

## Purpose

Task 18 turns the Task 17 export plan into a practical researcher workflow:

1. Apply the researcher export views in Supabase.
2. Inspect the views in Supabase SQL Editor.
3. Export researcher-facing CSV files.
4. Run local CSV export QA before any analysis.

This task does not create a public dashboard, does not expose student-level data to teachers or students, and does not store the name-to-code list in Supabase.

## Source Basis

- `docs/research-data-dictionary.md`
- `docs/researcher-export-dashboard-plan.md`
- `docs/supabase-research-export-queries.sql`
- `docs/supabase-research-qa-queries.sql`
- `docs/researcher-csv-export-manifest.md`

## Supabase SQL Editor Implementation

Run this file in the Supabase SQL Editor for the research project:

```text
docs/supabase-research-export-queries.sql
```

Expected views:

- `research_session_summary_export`
- `research_event_log_long_export`
- `research_complexity_exposure_export`
- `research_assessment_scores_export`
- `research_dashboard_overview_export`
- `research_privacy_exception_export`

The views use `security_invoker = true` so future API reads respect underlying table RLS. For research export, the preferred route is still manual researcher/admin review in Supabase SQL Editor, followed by controlled CSV export.

## Operator Checklist

Use this order in Supabase:

1. Open Supabase project `yangwu-research-lkkc-2026`.
2. Go to SQL Editor.
3. Paste the full contents of `docs/supabase-research-export-queries.sql`.
4. Run the SQL once.
5. If Supabase reports an error, stop and do not export CSVs.
6. Run the smoke checks below.
7. Open each export view result.
8. Download each result as CSV using the exact filename in `docs/researcher-csv-export-manifest.md`.
9. Put all CSV files in one local folder.
10. Run local CSV export QA against that folder.

## Supabase Smoke Checks

After applying the views, run small read-only checks:

```sql
select count(*) from research_session_summary_export;
select count(*) from research_event_log_long_export;
select count(*) from research_complexity_exposure_export;
select count(*) from research_assessment_scores_export;
select count(*) from research_dashboard_overview_export;
select count(*) from research_privacy_exception_export;
```

Then run the Task 16 QA checks:

```text
docs/supabase-research-qa-queries.sql
```

The privacy exception view should normally return zero rows. If it returns rows, do not use the export for analysis until the payload issue is fixed.

## CSV Download Names

Use these exact filenames:

- `dataset_session_summary.csv`
- `dataset_event_log_long.csv`
- `dataset_complexity_exposure.csv`
- `dataset_assessment_scores.csv`
- `dataset_dashboard_overview.csv`
- `dataset_privacy_exceptions.csv`

## Researcher CSV Export QA

Export the views using the filenames defined in:

```text
docs/researcher-csv-export-manifest.md
```

Then run local QA:

```bash
npm run check:research-csv-export -- /path/to/export-folder
```

The QA script checks:

- required CSV files exist;
- required columns are present;
- `live_dryrun_qa` is excluded from formal event exports;
- privacy exception CSV is empty except for headers;
- consent status is `included` where required;
- app/content/cohort fields are present for session and event exports;
- no obvious personal-data columns such as name, student ID, email, phone, or name-to-code are exported.

## Export Readiness

Before analysis:

- confirm `participants.consent_status = 'included'`;
- exclude `live_dryrun_qa`;
- confirm `app_version`, `research_cohort`, and `content_map_version`;
- confirm `research_privacy_exception_export` is empty;
- document incomplete or excluded sessions;
- keep the name-to-code list outside Supabase;
- store any researcher notes outside public app files.

## Interpretation Guardrails

- Event logs describe behaviour and exposure, not learning outcomes by themselves.
- Complexity dimensions describe opportunities to encounter multi-causal material, not mastery.
- RQ1 requires HEA, HNET, Transfer Task, PAQ, and scored rubric evidence.
- RQ2 can use process logs directly if phrased as engagement or exposure.
- RQ3 requires focus group or perception data; process logs only contextualise sampling and interpretation.

## Next Implementation Candidate

After Task 18:

1. Apply and verify the SQL views in the live Supabase project.
2. Export a dry-run CSV package.
3. Run `check:research-csv-export` on the exported folder.
4. Only after enough real rows exist, build the private researcher dashboard prototype.
