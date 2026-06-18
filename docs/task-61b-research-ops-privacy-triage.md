# Task 61B Research Ops Privacy Triage

Status: first triage pass completed  
Production app status: unchanged  
Public repository decision: keep app/runtime QA materials separate from active research operations

## Purpose

Task 61B separates files that are appropriate for the public app repository from files that should remain in local/private research operations storage.

The public app repository may contain source code, non-sensitive QA notes, dry-run technical checks, and general documentation needed to reproduce the deployed app. It should not contain active collection materials, real or operational participant/session-code materials, scoring workbooks, code slips, seed files for formal collection, raw responses, exported datasets, or identity-mapping materials.

## Public-Safe Repository Materials

The following categories can remain in the app repository if committed:

- production app source code and API routes;
- non-sensitive dry-run QA records;
- responsive UI, asset, and route-to-map readiness notes;
- tests that verify app stability, dry-run login flow, assets, and non-sensitive UI/data-path readiness;
- generic data dictionary and export-view SQL that does not include private identity mappings or active code-distribution materials.

## Private Research Operations Materials

The following categories should remain outside GitHub and outside Vercel deployment:

- active participant/session-code setup files;
- formal seed-generation inputs and generated SQL for collection accounts;
- code slips and printable collection-day packets;
- private scoring sheets, score-long tables, and assessment-entry workbooks;
- raw written responses, focus group materials, or assessment responses;
- real Supabase CSV exports;
- name-to-code or identity-matching files;
- documents that expose active collection-day logistics, operational code ranges, or private file paths.

These files have been moved under the ignored local path:

`private/research-ops/`

This path is intentionally excluded from Git by `.gitignore`.

## Current Public Candidate Set

The remaining public-candidate untracked files after triage are limited to technical or dry-run QA records:

- Task 27 front-end dry-run repeat;
- Task 28 assisted / real-device QA checklist;
- Task 30 mobile and iPad UI stabilisation gate;
- Task 31 rendered responsive UI readiness;
- Task 31B route-to-map mobile QA handoff;
- Task 34 asset render QA;
- Task 35 normal-flow route-to-map QA;
- matching non-sensitive test scripts for the above tasks.

## Remaining Caution

Some already tracked documents still contain historical references to formal readiness, participant/session-code planning, or check-account procedures. They should not be committed again until they are either:

1. rewritten as public-safe summaries; or
2. moved into private research operations and replaced by sanitized public notes.

This triage pass does not change the production app or Supabase schema. It only reduces the chance of accidentally publishing operational research materials.
