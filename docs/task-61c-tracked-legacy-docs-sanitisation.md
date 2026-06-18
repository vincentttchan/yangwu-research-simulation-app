# Task 61C Tracked Legacy Docs Sanitisation

Status: completed  
Production app status: unchanged  
Scope: public repository documentation hygiene

## Purpose

Task 61C sanitises tracked legacy documents that were written before the public app repository and private research-operations materials were separated.

The goal is to keep useful technical history in GitHub while preventing the public app repository from becoming the place where active collection procedures, operational participant/session-code details, private scoring workflows, or private research file structures are documented.

## Sanitised Files

- `docs/research-id-map.md`
- `docs/task-20-1-student-pilot-readiness-signoff.md`
- `docs/task-22-device-school-network-qa.md`
- `docs/task-22-device-school-network-qa-results.md`
- `tests/task22-device-network-qa-check.mjs`

## Main Changes

- Replaced formal collection-operation details with private-operations summaries.
- Removed operational participant/session-code ranges and checking-account details from public tracked docs.
- Kept dry-run technical identifiers only where they are part of public QA checks.
- Reframed Task 20.1 as a public technical dry-run record rather than a formal collection-day approval document.
- Reframed Task 22 as device/network technical QA, not full research readiness approval.
- Marked the normal-flow UI follow-up as open after the latest local run found an iPad landscape historical-event issue.

## Boundary

This pass does not change:

- production source code;
- Supabase schema;
- Vercel environment variables;
- public URL;
- research design documents stored outside this app repository.

Formal collection readiness, code slips, seed materials, scoring workbooks, raw responses, real exports, and name-to-code materials remain private research-operations materials.
