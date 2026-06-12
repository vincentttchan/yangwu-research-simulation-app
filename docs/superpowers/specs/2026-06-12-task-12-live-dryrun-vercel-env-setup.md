# Task 12 Live Dry-run QA / Vercel Env Setup Design Spec

Date: 2026-06-12  
Workstream: research/logger  
Status: setup and QA scaffold

## Purpose

Task 12 prepares live dry-run QA for the Supabase-backed research login flow on Vercel. It does not store secrets, create formal research data collection, or enable gameplay log submission.

The goal is to verify that the deployed environment can support the dry-run login pathway introduced in Task 11:

```text
Vercel Preview URL -> POST /api/login -> Supabase participants -> game_sessions dry-run row
```

## Scope

Task 12 includes:

- Vercel environment setup documentation;
- live dry-run QA script;
- expected response matrix for dry-run participant codes;
- safety stop conditions;
- documentation updates.

Task 12 does not:

- write real Supabase secrets to the repository;
- configure the user's Vercel account automatically;
- enable `POST /api/logs-batch`;
- mark formal research collection as ready;
- collect real student identifiers.

## Required Environment Variables

Server-side only:

- `SUPABASE_URL`;
- `SUPABASE_SECRET_KEY`;
- `SUPABASE_SCHEMA=public`;
- `RESEARCH_BACKEND_ENABLED=dry_run`;
- `RESEARCH_COHORT=lkkc-may-june-2026`;
- `APP_VERSION=dev-v0.1` or current release marker.

Production should remain `RESEARCH_BACKEND_ENABLED=false` until research freeze approval.

## Live QA Script

Task 12 adds:

- `tests/live-dryrun-qa-check.mjs`;
- `check:live-dryrun`.

When `DRYRUN_QA_BASE_URL` is absent, the script skips safely. When set, it tests:

- missing codes -> `400 missing_codes`;
- `YW-001` + `LKKC-2026-DRYRUN` -> `200` limited session object;
- `YW-999` + `LKKC-2026-DRYRUN` -> `403 invalid_or_excluded_participant`;
- wrong session code -> `403 invalid_or_excluded_participant`;
- `/api/logs-batch` -> `501 supabase_not_connected`.

Use `REQUIRE_LIVE_DRYRUN_QA=true` when a missing live URL should fail the check.

## Safety Boundary

The dry-run remains safe only if:

- real secrets stay in Vercel or `.env.local`, never git;
- frontend code does not import Supabase SDK;
- the API returns no participant notes or session code;
- formal research data collection remains not ready;
- logs-batch remains disconnected.

## Documentation Basis

- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel CLI env: https://vercel.com/docs/cli/env
- Vercel pull: https://vercel.com/docs/cli/pull
