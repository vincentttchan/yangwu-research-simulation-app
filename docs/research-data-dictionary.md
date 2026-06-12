# Yangwu Research Data Dictionary

Version: `task-16-dataset-qa-v0.1`  
App baseline: `dev-v0.1`  
Content map baseline: `content-freeze-lite-v0.1`  
Formal research data collection status: not ready

## Research Question Alignment

| Research question | Working meaning | Main data sources |
|---|---|---|
| RQ1 | Whether and how the scaffolded historical simulation supports evidence use, historical empathy, and argumentation outcomes. | `participants`, `game_sessions`, `assessment_responses`, `research_scores`, later HEA/HNET/Transfer/PAQ scoring files |
| RQ2 | How students engage with sources, evidence tasks, decisions, routes, and historical complexity during gameplay. | `event_logs`, `game_sessions`, `checkpoint_responses`, `derived_indicators` |
| RQ3 | How students perceive the learning experience and whether process patterns help contextualise focus group interpretation. | `assessment_responses`, focus group notes outside Supabase or later pseudonymous qualitative table, selected `event_logs` summaries |

Process logs are behavioural traces. They should not be interpreted as direct proof of historical understanding unless triangulated with written tasks, scored rubrics, and focus group evidence.

## Privacy Boundary

The Supabase research database uses pseudonymous participant codes only.

Do not store:

- student names;
- name-to-code matching list;
- student ID numbers;
- email addresses;
- phone numbers;
- visible choice prose;
- student free-text gameplay notes unless they are collected through an approved instrument table;
- raw school account credentials.

The name-to-code matching list, if needed for consent or withdrawal, remains outside Supabase in a password-protected researcher/school file.

## Core Tables

| Table | Grain | Data type | Research role | Main RQ |
|---|---|---|---|---|
| `participants` | One row per pseudonymous participant code | Pseudonymous background/control metadata | Links condition, class, and consent status without storing identity. | RQ1, RQ2 |
| `intervention_runs` | One row per class/session implementation | Implementation fidelity metadata | Documents whether the intended lesson condition was delivered. | RQ1, RQ2 |
| `game_sessions` | One row per login/play session | Raw session trace | Confirms exposure, device context, app version, and session status. | RQ1, RQ2 |
| `event_logs` | One row per logged gameplay event | Raw process trace | Captures city visits, evidence tasks, event openings, decisions, and completion markers. | RQ2 |
| `checkpoint_responses` | One row per scaffolded checkpoint response | Written scaffold response | Supports later coding of multi-causal reasoning and scaffold engagement. | RQ1, RQ2 |
| `assessment_responses` | One row per instrument item/response | Instrument response | Stores DCS, HEA, HNET, Transfer Task, perception items, and related responses when approved. | RQ1, RQ3 |
| `research_scores` | One row per coded score/dimension | Coded research score | Stores HEA, HNET, Transfer Task, PAQ, and other rubric scores. | RQ1 |
| `derived_indicators` | One row per derived indicator per participant/session | Derived indicator | Stores calculated engagement and historical complexity indicators for analysis/export. | RQ1, RQ2 |
| `export_batches` | One row per export action | Audit metadata | Records export type, filters, and notes for reproducibility. | All |

## Event Log Fields

| Field | Meaning | Research use | Privacy note |
|---|---|---|---|
| `session_id` | Supabase-generated session id from `game_sessions`. | Links process events to one play session. | Pseudonymous session id only. |
| `participant_code` | Research participant code such as `YW-001`. | Links events to condition and later scores. | Not a real name. |
| `client_event_id` | Optional browser-side event id. | Helps prevent duplicate inserts. | No identity. |
| `event_type` | Stable event taxonomy label. | Supports process sequence analysis. | Uses controlled labels only. |
| `payload` | Sanitized stable IDs and numeric/boolean flags. | Enables route/city/event/evidence decision analysis. | Server allowlist excludes prose and personal data. |
| `constructs` | Historical thinking constructs associated with the event. | Links behaviour to evidence use, historical empathy, argumentation, chronology, and complexity. | Controlled labels only. |
| `complexity_dimensions` | Substantive historical complexity dimensions exposed by the event. | Supports multi-causal exposure indicators. | Controlled labels only. |
| `client_time` | Browser event time. | Supports sequence and pacing checks. | Does not include location or identity. |
| `server_time` | Supabase insert time. | Supports audit and data quality checks. | Server timestamp only. |
| `app_version` | App version supplied by login/logging layer. | Protects analysis against changing game versions. | No identity. |
| `research_cohort` | Cohort label such as `lkkc-may-june-2026`. | Supports cohort filtering. | School/cohort label only. |
| `content_map_version` | Research ID/content map version. | Protects analysis when IDs/content change. | No identity. |

## Event Types

| Event type | Trigger | Main use |
|---|---|---|
| `session_start` | Student enters a playable route/map. | Exposure and session sequence start. |
| `city_entered` | Student enters a city scene. | Route breadth and location coverage. |
| `evidence_task_completed` | Student completes a city hotspot evidence task. | Evidence engagement and source exposure. |
| `event_opened` | Student opens a city, pinned, comparison, or terminal event. | Historical content exposure. |
| `decision_selected` | Student chooses an event option. | Decision timing and decision-after-evidence indicators. |
| `session_end` | Student reaches ending/settlement. | Completion and summary indicators. |

Other taxonomy labels such as `checkpoint_submitted` and `transfer_submitted` are reserved for later approved instrument/scaffold logging.

## Historical Complexity Dimensions

| Dimension | Meaning in this study |
|---|---|
| `technology` | Military, industrial, transport, telegraph, shipbuilding, or machine-related modernisation. |
| `institutions` | Administrative structures, yamen, arsenals, naval administration, schools, and enterprise governance. |
| `finance` | Funding, military expenditure, official-enterprise finance, resource constraints, and fiscal weakness. |
| `court_politics` | Conservative resistance, factional conflict, imperial priorities, and central decision-making. |
| `public_attitudes` | Social resistance, local beliefs, anti-foreign sentiment, public understanding, and popular support/opposition. |
| `actor_constraints` | Historical actors' limited information, institutional position, networks, and practical trade-offs. |
| `japan_comparison` | Meiji comparison, Sino-Japanese rivalry, naval expansion, and regional pressure. |

These dimensions help answer whether students encountered a multi-causal account of the Self-Strengthening Movement rather than only a simplified "Western technology" explanation.

## Derived Indicator Candidates

| Indicator | Source | Calculation sketch | Interpretation |
|---|---|---|---|
| `distinct_complexity_dimensions_encountered` | `event_logs.complexity_dimensions` | Count distinct dimensions per participant/session. | Breadth of multi-causal exposure. |
| `evidence_tasks_completed_total` | `event_logs` | Count `event_type = 'evidence_task_completed'`. | Evidence-task engagement volume. |
| `evidence_before_decision_ratio` | `event_logs` | Decisions after at least one prior evidence task divided by total decisions. | Whether decisions tended to follow evidence exposure. |
| `japan_comparison_exposure` | `event_logs.complexity_dimensions` | Flag/count exposure to `japan_comparison`. | Whether comparative East Asian context was encountered. |
| `institutional_political_financial_exposure` | `event_logs.complexity_dimensions` | Flag/count exposure to `institutions`, `court_politics`, or `finance`. | Whether non-technological explanations were encountered. |
| `checkpoint_completion_rate` | `checkpoint_responses`, `event_logs` | Completed scaffold checkpoints divided by expected checkpoints. | Scaffold participation, not reasoning quality by itself. |
| `multi_causal_checkpoint_reference` | `checkpoint_responses`, later coding | Coded reference to more than one causal dimension. | Written evidence of multi-causal reasoning. |
| `completed_intervention_session` | `game_sessions`, `event_logs` | Completion flag from `session_end` or `completion_status`. | Fidelity/exposure filter for outcome analysis. |

## Interpretation Guardrails

- High event count is engagement, not necessarily understanding.
- High evidence-task count is exposure, not automatically good evidence use.
- Complexity dimensions indicate opportunity to encounter multi-causal material, not mastery.
- RQ1 outcome claims require scored HEA, HNET, Transfer Task, and PAQ evidence.
- RQ2 process claims can use event logs directly, but should be phrased as engagement or exposure patterns.
- RQ3 perception claims require focus group and perception item evidence; logs only contextualise those interpretations.
