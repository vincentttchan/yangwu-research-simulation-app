create table participants (
  participant_code text primary key,
  session_code text not null,
  class_id text not null,
  condition text not null check (condition in ('standard', 'scaffolded')),
  consent_status text not null check (consent_status in ('included', 'excluded', 'withdrawn')),
  created_at timestamptz not null default now(),
  notes text
);

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

alter table participants enable row level security;
alter table intervention_runs enable row level security;
alter table game_sessions enable row level security;
alter table event_logs enable row level security;
alter table checkpoint_responses enable row level security;
alter table assessment_responses enable row level security;
alter table research_scores enable row level security;
alter table derived_indicators enable row level security;
alter table export_batches enable row level security;
