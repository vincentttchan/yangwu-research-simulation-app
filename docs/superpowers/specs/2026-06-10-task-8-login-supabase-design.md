# Task 8 Login And Supabase Research Data Design

Date: 2026-06-10  
Workstream: research/logger  
Status: design spec, not implementation

## 1. Purpose

Task 8 defines the research login flow and Supabase database draft for the Self-Strengthening Movement simulation research version. It translates the current research design into a technical data structure that can support participant-code login, process logging, assessment storage, scoring, and later research export.

This task does not implement the login screen, API routes, Supabase connection, dashboard, or data submission. It is a design freeze for the next backend implementation sprint.

## 2. Research Framing

The technical design must support the study:

> Learning Historical Complexity through a GenAI-Assisted Scaffolded Historical Simulation in Chinese History Education: Evidence Use, Historical Empathy, and Argumentation in the Self-Strengthening Movement

The backend is not designed as a general game analytics platform. It is designed to support a school-based educational research study. The database should help connect:

- participant condition;
- planned intervention delivery;
- intervention exposure;
- gameplay process;
- source and evidence engagement;
- metacognitive checkpoint responses;
- written assessment responses;
- rubric-based research scoring;
- version and content-map traceability.

The core evidence chain is:

```text
participant grouping
-> planned intervention run
-> actual simulation session
-> city/event/evidence/task path
-> scaffold exposure and checkpoint reasoning
-> written outcome responses
-> rubric scores
-> mixed-methods interpretation
```

## 3. Recommended Architecture

Use Vercel API routes as the server-side boundary and Supabase PostgreSQL as the research database.

```text
Student browser
  -> Vercel static game
  -> Vercel API routes
  -> Supabase PostgreSQL
  -> researcher export / analysis
```

This is preferred over direct frontend-to-Supabase writes because the study handles pseudonymous research data and written responses. Vercel API routes can validate participant codes, filter payloads, attach server timestamps, and keep Supabase service credentials away from browser code.

## 4. Login Model

### 4.1 Student Login Fields

Students enter:

- `participant_code`
- `session_code`

Example:

```text
Participant code: YW-014
Session code: LKKC-2026
```

The frontend must not ask students for:

- real name;
- personal email;
- phone number;
- social login;
- school login password;
- student ID number, unless separately approved outside this system.

### 4.2 Login Flow

1. Student opens the deployed Vercel URL.
2. Login screen asks for participant code and session code.
3. Frontend sends both codes to `POST /api/login`.
4. Vercel API validates the codes against Supabase `participants`.
5. API rejects excluded or withdrawn participants.
6. If valid, API creates one `game_sessions` row.
7. API returns a limited research session object.
8. Frontend stores the session object in session storage.
9. Game starts or resumes.
10. Local Task 7 logs are later attached to this session for batch submission.

### 4.3 Returned Session Object

The frontend should only receive:

```json
{
  "session_id": "uuid",
  "participant_code": "YW-014",
  "class_id": "LKKC-S4A",
  "condition": "scaffolded",
  "app_version": "research-v1.0-lkkc-may2026",
  "research_cohort": "lkkc-may-june-2026"
}
```

The frontend should not receive:

- notes field;
- consent history;
- other participants' information;
- name-to-code linkage;
- researcher/admin role data.

## 5. Data Collection Boundaries

### 5.1 Collect

The research backend may collect:

- participant code;
- class/group metadata;
- condition;
- consent status;
- intervention run metadata;
- session start/end records;
- device category and viewport size;
- app version and research cohort;
- content map version;
- Task 7 low-risk process events;
- metacognitive checkpoint responses;
- assessment responses;
- researcher-entered rubric scores;
- analysis-ready derived indicators;
- export batch records.

### 5.2 Do Not Collect

The research backend should not collect:

- student real names;
- email addresses;
- phone numbers;
- social login accounts;
- GPS location;
- webcam, microphone, or screen recording;
- unrelated browsing data;
- name-to-code matching list;
- raw school account credentials.

### 5.3 Separate Name-To-Code List

If a name-to-code matching list is needed for consent, withdrawal, or class management, it should be kept outside the game database in a password-protected file held by the researcher or school. The Supabase database should only store pseudonymous participant codes.

## 6. Research Question And Database Alignment

The database design should make the research questions analysable without overcollecting data.

### RQ1: Outcome Effects

RQ1 asks whether and how the scaffolded simulation supports students' evidence use, historical empathy, and argumentation.

Relevant tables:

| Table | RQ1 function |
|---|---|
| `participants` | Identifies condition, class, and consent status for between-condition comparison. |
| `intervention_runs` | Confirms which class/session received which version of the intervention and whether the planned lesson was delivered. |
| `assessment_responses` | Stores DCS, HEA, HNET, Transfer Task, and other instrument responses. |
| `research_scores` | Stores HEA, HNET, Transfer Task, and PAQ scores for statistical comparison. |
| `game_sessions` | Confirms whether students actually participated in the intervention before outcome interpretation. |

Analytical use:

- compare pre/post HEA scores;
- compare HNET and Transfer Task performance by condition;
- use PAQ subdimensions to examine argumentation quality;
- use Digital Competency Survey as a background or matching/control variable;
- distinguish outcome interpretation by intervention run, app version, and content map version;
- exclude or flag incomplete intervention exposure.

### RQ2: Process And Engagement

RQ2 asks how students engage with sources, evidence tasks, decisions, and scaffolds during the simulation.

Relevant tables:

| Table | RQ2 function |
|---|---|
| `event_logs` | Records city visits, evidence task completion, event opening, decision selection, session start/end. |
| `checkpoint_responses` | Records scaffolded reflection and metacognitive reasoning. |
| `game_sessions` | Supports duration, completion, device, and version checks. |
| `intervention_runs` | Links process patterns to a particular classroom implementation, not only to an abstract condition label. |
| `participants` | Links process patterns to condition and class. |

Analytical use:

- count source/evidence exposure before decisions;
- compare route breadth and city/event coverage;
- identify whether students encountered multiple explanatory dimensions, such as technology, institutions, finance, politics, public attitudes, and actor constraints;
- derive historical complexity indicators from content-map dimensions rather than treating click frequency as understanding;
- examine whether scaffolded checkpoints are completed and whether their responses show weighing of historical complexity;
- connect process indicators to outcome scores cautiously.

Process logs should be interpreted as behavioural traces, not direct proof of understanding. They become meaningful when triangulated with written responses and focus group data.

### RQ3: Student Perceptions

RQ3 asks how students perceive the learning experience and whether they feel the simulation supports historical understanding.

Relevant tables:

| Table | RQ3 function |
|---|---|
| `assessment_responses` | Can store short post-task perception items if included. |
| `event_logs` | Helps contextualise focus group sampling, such as high/low completion or varied route patterns. |

Focus group transcripts or notes may be stored outside Supabase if preferred for ethics and qualitative data control. If they are stored in Supabase later, they should use a separate `focus_group_notes` table with pseudonymous participant codes only.

## 7. Historical Complexity And Derived Indicators

The study should not treat time-on-task, number of clicks, or number of opened events as direct evidence of historical understanding. These are behavioural traces. They become useful when transformed into theoretically meaningful indicators and triangulated with written responses and focus group data.

### 7.1 Historical Complexity Dimensions

Content-map records and event payloads should identify the historical dimensions each event or evidence task exposes. Recommended dimension labels:

| Dimension | Meaning in the Self-Strengthening Movement topic |
|---|---|
| `technology` | Military, industrial, transport, telegraph, shipbuilding, or machine-related modernisation. |
| `institutions` | Administrative structures, yamen, arsenals, naval administration, schools, or enterprise governance. |
| `finance` | Funding, military expenditure, official-enterprise finance, resource constraints, and fiscal weakness. |
| `court_politics` | Conservative resistance, factional conflict, imperial priorities, and central decision-making. |
| `public_attitudes` | Social resistance, local beliefs, anti-foreign sentiment, public understanding, and popular support or opposition. |
| `actor_constraints` | Historical actors' limited information, institutional position, personal networks, and practical trade-offs. |
| `japan_comparison` | Meiji comparison, Sino-Japanese rivalry, naval expansion, and regional pressure. |

These dimensions should be stored as `complexity_dimensions` in `event_logs` and `checkpoint_responses`, and documented in the export readme.

### 7.2 Suggested Derived Indicators

The following variables should be calculated during export or analysis:

| Indicator | Source tables | Research use |
|---|---|---|
| `distinct_complexity_dimensions_encountered` | `event_logs` | Measures whether the student encountered multiple explanatory dimensions rather than only technology. |
| `evidence_tasks_completed_total` | `event_logs` | Describes evidence-task engagement. |
| `evidence_before_decision_ratio` | `event_logs` | Estimates whether major decisions followed evidence exposure. |
| `japan_comparison_exposure` | `event_logs` | Indicates whether the student encountered comparative East Asian evidence. |
| `institutional_political_financial_exposure` | `event_logs` | Tracks exposure to non-technological explanations for the movement's limitations. |
| `checkpoint_completion_rate` | `checkpoint_responses`, `event_logs` | Checks scaffold participation in the experimental condition. |
| `multi_causal_checkpoint_reference` | `checkpoint_responses`, later coding | Indicates whether checkpoint writing refers to more than one causal dimension. |
| `completed_intervention_session` | `game_sessions`, `intervention_runs` | Supports fidelity filtering before outcome comparison. |

These indicators should be interpreted cautiously. For example, a high evidence-task count does not automatically mean high-quality evidence use; it should be read alongside HNET, Transfer Task, PAQ, and focus group data.

## 8. Proposed Supabase Tables

### 8.1 `participants`

Purpose: stores pseudonymous research participant metadata and eligibility.

```sql
create table participants (
  participant_code text primary key,
  session_code text not null,
  class_id text not null,
  condition text not null check (condition in ('standard', 'scaffolded')),
  consent_status text not null check (consent_status in ('included', 'excluded', 'withdrawn')),
  created_at timestamptz not null default now(),
  notes text
);
```

Research notes:

- `participant_code` supports matching across pre/post, gameplay, and scores.
- `condition` supports standard vs scaffolded comparison.
- `consent_status` allows exclusion without deleting seed records immediately.
- `notes` is researcher-only and should not store student names.

### 8.2 `intervention_runs`

Purpose: records planned classroom intervention delivery and fidelity at the class/session level.

```sql
create table intervention_runs (
  intervention_run_id uuid primary key default gen_random_uuid(),
  class_id text not null,
  condition text not null check (condition in ('standard', 'scaffolded')),
  run_date date not null,
  school_code text not null default 'LKKC',
  app_version text not null,
  research_cohort text not null,
  content_map_version text,
  planned_duration_minutes integer,
  actual_duration_minutes integer,
  teacher_debrief_completed boolean not null default false,
  implementation_status text not null default 'planned',
  fidelity_notes text
);
```

Research notes:

- This table prevents the study from relying only on student-level logs to infer whether the intervention was delivered.
- It supports intervention fidelity checks, such as whether the scaffolded condition included the intended metacognitive checkpoints and teacher debriefing.
- `fidelity_notes` should document implementation issues, such as shortened lessons, Wi-Fi disruption, or timetable interruption. It should not evaluate teacher performance.

### 8.3 `game_sessions`

Purpose: records each login/play session.

```sql
create table game_sessions (
  session_id uuid primary key default gen_random_uuid(),
  participant_code text not null references participants(participant_code),
  intervention_run_id uuid references intervention_runs(intervention_run_id),
  app_version text not null,
  research_cohort text not null,
  content_map_version text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  device_category text,
  viewport_width integer,
  viewport_height integer,
  browser_family text,
  completion_status text not null default 'started'
);
```

Research notes:

- `app_version` and `content_map_version` protect analysis against changes in the game.
- `intervention_run_id` links a student session to an actual classroom implementation.
- `device_category` helps interpret iPad/mobile usability issues.
- `completion_status` supports intervention fidelity checks.

### 8.4 `event_logs`

Purpose: stores low-risk process events from Task 7 and later event types.

```sql
create table event_logs (
  log_id uuid primary key default gen_random_uuid(),
  client_event_id text unique,
  session_id uuid not null references game_sessions(session_id),
  participant_code text not null references participants(participant_code),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  constructs text[] not null default '{}',
  complexity_dimensions text[] not null default '{}',
  client_time timestamptz,
  server_time timestamptz not null default now(),
  app_version text not null,
  research_cohort text not null,
  content_map_version text
);
```

Research notes:

- `constructs` supports direct alignment with evidence use, historical complexity, historical empathy, argumentation, chronology, and comparative perspective.
- `complexity_dimensions` supports more precise analysis of historical complexity exposure.
- `client_event_id` reduces duplicate batch insert problems.
- `payload` should store stable IDs rather than visible prose.

Task 7 event types:

- `session_start`
- `city_entered`
- `evidence_task_completed`
- `event_opened`
- `decision_selected`
- `session_end`

### 8.5 `checkpoint_responses`

Purpose: stores scaffolded metacognitive checkpoint answers.

```sql
create table checkpoint_responses (
  response_id uuid primary key default gen_random_uuid(),
  session_id uuid not null references game_sessions(session_id),
  participant_code text not null references participants(participant_code),
  condition text not null check (condition in ('standard', 'scaffolded')),
  checkpoint_id text not null,
  event_id text,
  city_id text,
  prompt_id text,
  constructs text[] not null default '{}',
  complexity_dimensions text[] not null default '{}',
  response_text text not null,
  response_length integer,
  submitted_at timestamptz not null default now(),
  app_version text not null,
  research_cohort text not null,
  content_map_version text
);
```

Research notes:

- The table is central to scaffolded simulation analysis.
- `checkpoint_id` and `prompt_id` allow prompt-level comparison.
- `complexity_dimensions` can show whether the checkpoint asked students to consider technology, institutions, finance, politics, public attitudes, or actor constraints.
- Text length is a rough descriptive indicator only, not a quality measure.
- Coding should happen later through `research_scores` or qualitative coding files.

### 8.6 `assessment_responses`

Purpose: stores instrument responses, including surveys and written tasks.

```sql
create table assessment_responses (
  response_id uuid primary key default gen_random_uuid(),
  participant_code text not null references participants(participant_code),
  session_id uuid references game_sessions(session_id),
  instrument text not null,
  phase text not null check (phase in ('pre', 'post', 'during')),
  item_id text,
  response_text text,
  response_json jsonb,
  submitted_at timestamptz not null default now(),
  app_version text not null,
  research_cohort text not null,
  instrument_version text
);
```

Supported instruments:

- Digital Competency Survey;
- Historical Empathy Assessment;
- Historical Narrative Evaluation Task;
- Transfer Task;
- post-task perception items, if used.

Research notes:

- Likert items can use `response_json`.
- HEA, HNET, and Transfer Task written answers can use `response_text`.
- `phase` distinguishes pre/post/during measurement.
- `instrument_version` protects the analysis if instruments are revised after pilot testing.

### 8.7 `research_scores`

Purpose: stores researcher or second-coder scoring.

```sql
create table research_scores (
  score_id uuid primary key default gen_random_uuid(),
  participant_code text not null references participants(participant_code),
  response_id uuid references assessment_responses(response_id),
  instrument text not null,
  dimension text not null,
  score numeric not null,
  coder_id text not null,
  rubric_version text not null,
  coded_at timestamptz not null default now(),
  notes text
);
```

Example dimensions:

- `HEA_contextual_understanding`;
- `HEA_perspective_taking`;
- `HNET_error_identification`;
- `Transfer_total_10`;
- `PAQ_point`;
- `PAQ_evidence`;
- `PAQ_explanation`;
- `PAQ_link`.

Research notes:

- This table separates raw student responses from scoring decisions.
- Multiple coders can score the same response.
- Inter-rater reliability can be checked by comparing coder scores.
- `rubric_version` is required because HEA, HNET, Transfer Task, and PAQ scoring criteria may be refined after pilot review.

### 8.8 `derived_indicators`

Purpose: stores analysis-ready variables derived from raw logs and responses.

```sql
create table derived_indicators (
  indicator_id uuid primary key default gen_random_uuid(),
  participant_code text not null references participants(participant_code),
  session_id uuid references game_sessions(session_id),
  indicator_name text not null,
  indicator_value numeric,
  indicator_json jsonb,
  derivation_version text not null,
  created_at timestamptz not null default now(),
  notes text
);
```

Research notes:

- This table is optional for the first backend build, but the export must still define these derived variables.
- Derived indicators should be reproducible from raw logs and documented in the export readme.
- These variables support RQ2 without overinterpreting raw clicks as learning.

### 8.9 `export_batches`

Purpose: records research export history.

```sql
create table export_batches (
  export_id uuid primary key default gen_random_uuid(),
  export_type text not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  app_version_filter text,
  research_cohort_filter text,
  file_path text,
  notes text
);
```

Research notes:

- Supports audit trail and transparent data handling.
- First version can rely on manual Supabase export, but export records are still useful if an API export is added later.

## 9. API Route Draft

Task 8 defines the shape only. Implementation is deferred.

| Route | Purpose |
|---|---|
| `POST /api/login` | Validate participant/session code and create `game_sessions` row. |
| `POST /api/logs/batch` | Submit queued Task 7 process events to `event_logs`. |
| `POST /api/checkpoint` | Submit scaffold checkpoint response. |
| `POST /api/assessment` | Submit DCS/HEA/HNET/Transfer responses. |
| `POST /api/session/end` | Mark a session as completed, abandoned, or ended. |
| `GET /api/research/export` | Researcher-only export endpoint, optional later. |

## 10. Local Queue And Batch Submission

The existing local queue remains important even after Supabase is connected:

- school Wi-Fi may be unstable;
- students may use iPads or phones;
- submissions should retry without alarming students;
- logs should not be lost if a batch submission fails.

Recommended batch behaviour:

1. Continue writing events to `yangwu_research_event_queue_v1`.
2. Attach `session_id` after successful login.
3. Submit batches to `POST /api/logs/batch`.
4. Keep unsent events until the server confirms insertion.
5. Use `client_event_id` to prevent duplicate inserts.

## 11. Security And Access Boundaries

### Frontend can know

- app version;
- research cohort;
- content map version;
- participant's own limited session object;
- public game content.

### Frontend must not know

- Supabase service role key;
- name-to-code matching list;
- other participants' records;
- researcher export credentials.

### Backend should validate

- method is allowed;
- participant code exists;
- session code matches;
- consent status is included;
- condition matches participant record;
- payload size is within limits;
- event type is allowed;
- app version is accepted;
- text fields are within expected length.

## 12. Research Export Draft

First version exports should prioritise research usefulness over a polished dashboard.

Recommended export files:

- `participants.csv`
- `intervention_runs.csv`
- `sessions.csv`
- `event_logs.jsonl`
- `checkpoint_responses.csv`
- `assessment_responses.csv`
- `research_scores.csv`
- `derived_indicators.csv`
- `export_readme.md`

The export readme should document:

- export date;
- app version;
- research cohort;
- content map version;
- condition labels;
- event taxonomy;
- historical complexity dimension definitions;
- derived indicator definitions and derivation version;
- missing data codes;
- scoring status;
- coder identifiers, rubric version, and scoring version.

## 13. First-Version Dashboard Position

Do not build a teacher/researcher dashboard in the first backend sprint. Use Supabase table view or manual exports first.

Reason:

- dashboard design can easily expand scope;
- export accuracy matters more than visual reporting for the first research deployment;
- teacher-facing summaries should be ethically reviewed before showing individual-level learning data.

Dashboard can be a later sprint after the schema, login, and export workflow are stable.

## 14. Open Decisions Before Implementation

These must be confirmed before backend code is implemented:

1. Exact participant code format.
2. Whether group condition is visible in the code or hidden in the database.
3. Final research version label, such as `research-v1.0-lkkc-may2026`.
4. Supabase project region and provider disclosure wording.
5. Whether focus group notes remain outside Supabase.
6. Retention period and deletion procedure for final ethics documentation.
7. Whether first implementation includes only login + event logs, or also checkpoint and assessment submission.
8. Final historical complexity dimension labels.
9. Initial instrument and rubric version labels.

## 15. Acceptance Criteria For Task 8

Task 8 is complete when:

- the login model uses participant code + session code;
- no email/password/social login is required;
- the database schema draft includes participant, session, event, checkpoint, assessment, score, and export layers;
- the schema includes an intervention fidelity layer;
- each table has a clear research purpose;
- RQ1/RQ2/RQ3 alignment is explicit;
- historical complexity dimensions and derived indicators are defined;
- rubric and instrument versioning are included;
- data minimisation boundaries are documented;
- Supabase implementation is deferred to a later sprint;
- no game UI or backend code is changed by this design task.
