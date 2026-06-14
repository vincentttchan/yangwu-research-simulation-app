# Task 23 More Event Coverage Plan

Status: design and approval gate prepared; implementation not yet started  
Formal research data collection status: not approved until the approved coverage changes are implemented, deployed, and QA checked

## Purpose

Task 23 reviews whether the research logger should capture additional low-risk gameplay events beyond the current core flow. The goal is to improve RQ2 process analysis and pilot QA without collecting student free text, visible choice prose, names, contact details, or other identifying information.

Current active event coverage:

- `session_start`
- `city_entered`
- `evidence_task_completed`
- `event_opened`
- `decision_selected`
- `session_end`

This is already enough for a basic process trace. Task 23 should add only events that improve interpretation or QA in a clear way.

## Research Rationale

More event coverage may help answer:

- whether students open evidence/source material but fail to complete it;
- whether students use the journal or guidance layer when navigating;
- whether students encounter and respond to in-event historical reasoning checkpoints;
- whether incomplete sessions reflect low engagement, confusing UI, or technical friction;
- whether iPad/phone/school-network problems affect process data quality.

These are RQ2 and implementation-fidelity questions. They should not be interpreted as direct learning outcomes.

## Privacy Boundary

Additional events must keep the same data-minimisation boundary:

- log stable IDs, numeric values, booleans, and controlled labels only;
- do not log visible event prose, choice labels, student written responses, notes, names, student IDs, emails, phone numbers, or name-to-code fields;
- keep Supabase writes behind `POST /api/logs-batch`;
- update the server allowlist before relying on any new payload field;
- update privacy QA if a new sensitive-risk field is considered.

## Recommended Coverage Additions

### 1. `source_opened`

Trigger:

- student opens an evidence/hotspot task or source-like inspection panel.

Why:

- Current `evidence_task_completed` only records completion. If a student opens evidence but leaves, current data cannot distinguish interest from non-exposure.

Safe payload:

- `route_id`
- `city_id`
- `evidence_task_id`
- `hotspot_id`
- `event_id`, if mapped
- `task_type`
- `source = 'hotspot'` or another controlled label
- `year`
- `season`

Interpretation:

- source/evidence exposure attempt, not evidence understanding.

### 2. `checkpoint_submitted`

Trigger:

- student responds to an in-event challenge / 幕僚追問 / reasoning checkpoint.

Why:

- Current session-end summary records total `challenge_correct`, but not which historical event or dimension triggered the challenge.

Safe payload:

- `route_id`
- `city_id`
- `event_id`
- `event_kind`
- `choice_axis`
- `challenge_correct`
- `attempt_index`, if available as a number
- `year`
- `season`

Interpretation:

- in-game checkpoint response trace, not a scored HEA/HNET/Transfer result.

### 3. `journal_opened`

Trigger:

- student opens the journey journal / 手卷.

Why:

- Journal use may indicate navigation support, route planning, or recovery from confusion. It is useful for mobile/iPad QA and focus-group sampling.

Safe payload:

- `route_id`
- `city_id`
- `year`
- `season`
- `ui_surface = 'journal'`

Interpretation:

- navigation/support behaviour, not historical understanding.

### 4. `technical_recovery`

Trigger:

- app detects or user action implies a recovery condition, such as continuing after reload with an existing session or queued logs being flushed after temporary failure.

Why:

- Helps distinguish real engagement gaps from technical interruptions.

Safe payload:

- `route_id`, if available
- `city_id`, if available
- `recovery_type` as a controlled label, such as `session_restored` or `queued_logs_flushed`
- `queued_event_count`, if available as a number

Interpretation:

- implementation-fidelity and data-quality marker only.

## Not Recommended For Task 23

Do not add these in the current sprint:

- full mouse/touch coordinates;
- keystrokes;
- scroll depth;
- time-on-each-paragraph;
- visible source text copied into payload;
- student written reflections inside gameplay logs;
- teacher comments or observational notes inside `event_logs`;
- individual performance labels shown to teachers.

These either increase privacy risk, create noisy data, or belong in approved instrument/field-note workflows rather than automatic gameplay logging.

## Implementation Scope If Approved

Expected files:

- `src/research/event-taxonomy.js`
- `src/research/instrumentation.js`
- `src/intro.js`
- `api/logs-batch.js`
- `docs/research-data-dictionary.md`
- `docs/research-id-map.md`
- `docs/supabase-research-export-queries.sql`, only if new payload fields should appear as explicit CSV columns
- tests for instrumentation, server allowlist, and export/QA expectations

Expected checks:

```bash
npm run check:instrumentation
npm run check:supabase-logs
npm run check:research-data
npm run check:research-export-implementation
npm run check:syntax
npm run build
```

## Proposed Minimal Implementation Order

1. Add `source_opened` first.
2. Add `checkpoint_submitted` second.
3. Add `journal_opened` only if we agree it helps mobile/iPad QA or focus-group sampling.
4. Defer `technical_recovery` until after the first classroom device/network QA unless technical disruption becomes common.

## Approval Decision

Recommended approval:

- approve `source_opened`;
- approve `checkpoint_submitted`;
- conditionally approve `journal_opened`;
- defer `technical_recovery`.

This gives better RQ2 coverage while keeping the privacy and export surface controlled.
