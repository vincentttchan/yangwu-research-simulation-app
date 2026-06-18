# Task 59: Formal UI Freeze Sign-Off

Date: 2026-06-18
Project: Yangwu Research Simulation
Cohort: `lkkc-may-june-2026`
Status: UI frozen locally; production smoke test still required after deployment.

## Frozen Version Markers

| Field | Frozen value | Source of truth |
|---|---|---|
| `APP_VERSION` | `lkkc-formal-ui-freeze-v1.0` | `src/research/version.js` |
| `RESEARCH_COHORT` | `lkkc-may-june-2026` | `src/research/version.js` |
| `content_map_version` | `content-freeze-formal-v1.0` | `src/research/content-map.js` |
| Logger queue | `yangwu_research_event_queue_v1` | `src/research/content-map.js` |

## Freeze Decision

The current UI, interaction flow, visual polish, historical content presentation, route IDs, city IDs, event IDs, evidence task IDs, and research logging version markers are frozen for the formal collection candidate build.

After this point, further changes to UI layout, event wording, evidence wording, route flow, map behaviour, login flow, or research logging should be treated as a new version decision. Minor typo fixes may still be made only if they are recorded and followed by a repeated smoke test.

## Files Updated During Freeze

- `src/research/version.js`
- `src/research/content-map.js`
- `.env.example`
- `api/login.js`
- `api/logs-batch.js`
- `docs/research-id-map.md`
- `docs/research-data-dictionary.md`
- `tests/research-content-map-check.mjs`
- `tests/stability-checks.mjs`

## Local Verification

| Check | Result | Notes |
|---|---|---|
| `npm run check:syntax` | Pass | JavaScript/API syntax checked. |
| `npm run check:research-map` | Pass | Research IDs match game source and formal content map version. |
| `npm run check:assets` | Pass | Asset references resolved. |
| `npm run check:stability` | Pass | Existing UI stability assertions passed after version marker update. |
| `npm run check:instrumentation` | Pass | Research instrumentation checks passed. |
| `npm run check:login-ui` | Pass | Research login UI checks passed. |
| `npm run build` | Pass | Production build completed. Vite reported an existing dynamic/static import chunking notice for the logger, not a build failure. |

## Important Boundary

This sign-off does not mean the deployed Vercel Production site has already been checked with the new version marker. The next required gate is production smoke testing after deployment and Vercel environment alignment.

## Next Gate

Run the production smoke test using the reserved checking account:

- participant code: `YW-190`
- session code: `S490`
- expected app version: `lkkc-formal-ui-freeze-v1.0`
- expected research cohort: `lkkc-may-june-2026`
- expected content map version: `content-freeze-formal-v1.0`

The formal collection build should be treated as ready only after:

1. Vercel Production has been redeployed from the frozen source.
2. Vercel Production `APP_VERSION` environment variable is updated to `lkkc-formal-ui-freeze-v1.0`.
3. A production login and gameplay smoke test creates fresh Supabase rows.
4. The latest Supabase `game_sessions` and `event_logs` rows show the frozen version markers above.
