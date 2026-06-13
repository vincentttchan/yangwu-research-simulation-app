-- Task 17 Researcher Export Queries
-- These queries are designed as export/view definitions for researcher use.
-- Run after Task 16 QA queries. Do not include live_dryrun_qa rows in formal exports.

-- Session-level export: one row per participant/session.
create or replace view research_session_summary_export as
select
  gs.participant_code,
  gs.session_id,
  p.class_id,
  p.condition,
  p.consent_status,
  gs.app_version,
  gs.research_cohort,
  gs.content_map_version,
  gs.device_category,
  gs.viewport_width,
  gs.viewport_height,
  gs.browser_family,
  gs.started_at,
  gs.ended_at,
  gs.completion_status,
  count(el.log_id) filter (where el.event_type <> 'live_dryrun_qa') as event_count,
  min(el.server_time) filter (where el.event_type <> 'live_dryrun_qa') as first_event_time,
  max(el.server_time) filter (where el.event_type <> 'live_dryrun_qa') as last_event_time,
  case
    when gs.completion_status = 'completed'
      or bool_or(el.event_type = 'session_end') then 1
    else 0
  end as completed_intervention_session
from game_sessions gs
join participants p on p.participant_code = gs.participant_code
left join event_logs el on el.session_id = gs.session_id
group by
  gs.participant_code,
  gs.session_id,
  p.class_id,
  p.condition,
  p.consent_status,
  gs.app_version,
  gs.research_cohort,
  gs.content_map_version,
  gs.device_category,
  gs.viewport_width,
  gs.viewport_height,
  gs.browser_family,
  gs.started_at,
  gs.ended_at,
  gs.completion_status;

-- Event-level long export: one row per valid process event.
create or replace view research_event_log_long_export as
select
  el.log_id,
  el.participant_code,
  el.session_id,
  p.class_id,
  p.condition,
  el.event_type,
  el.client_time,
  el.server_time,
  el.payload ->> 'route_id' as route_id,
  el.payload ->> 'city_id' as city_id,
  el.payload ->> 'event_id' as event_id,
  el.payload ->> 'event_kind' as event_kind,
  el.payload ->> 'evidence_task_id' as evidence_task_id,
  el.payload ->> 'hotspot_id' as hotspot_id,
  el.payload ->> 'choice_id' as choice_id,
  nullif(el.payload ->> 'choice_index', '')::integer as choice_index,
  el.payload ->> 'choice_axis' as choice_axis,
  el.constructs,
  el.complexity_dimensions,
  el.app_version,
  el.research_cohort,
  el.content_map_version
from event_logs el
join participants p on p.participant_code = el.participant_code
where el.event_type <> 'live_dryrun_qa'
  and p.consent_status = 'included';

-- Complexity/process indicator export: one row per participant/session.
create or replace view research_complexity_exposure_export as
with valid_events as (
  select *
  from event_logs
  where event_type <> 'live_dryrun_qa'
),
expanded_dimensions as (
  select
    participant_code,
    session_id,
    unnest(complexity_dimensions) as complexity_dimension
  from valid_events
),
dimension_summary as (
  select
    participant_code,
    session_id,
    count(distinct complexity_dimension) as distinct_complexity_dimensions_encountered,
    array_agg(distinct complexity_dimension order by complexity_dimension) as dimensions_encountered
  from expanded_dimensions
  group by participant_code, session_id
),
ordered_events as (
  select
    log_id,
    participant_code,
    session_id,
    event_type,
    complexity_dimensions,
    coalesce(client_time, server_time) as event_time,
    count(*) filter (where event_type = 'evidence_task_completed') over (
      partition by session_id
      order by coalesce(client_time, server_time), server_time, log_id
      rows between unbounded preceding and 1 preceding
    ) as prior_evidence_count
  from valid_events
),
event_summary as (
  select
    participant_code,
    session_id,
    count(*) filter (where event_type = 'evidence_task_completed') as evidence_tasks_completed_total,
    count(*) filter (where event_type = 'decision_selected') as decision_count,
    count(*) filter (
      where event_type = 'decision_selected'
        and prior_evidence_count > 0
    ) as decisions_after_evidence,
    count(*) filter (where 'japan_comparison' = any(complexity_dimensions)) as japan_comparison_exposure,
    count(*) filter (
      where complexity_dimensions && array['institutions', 'court_politics', 'finance']::text[]
    ) as institutional_political_financial_exposure
  from ordered_events
  group by participant_code, session_id
)
select
  gs.participant_code,
  gs.session_id,
  p.class_id,
  p.condition,
  coalesce(ds.distinct_complexity_dimensions_encountered, 0) as distinct_complexity_dimensions_encountered,
  coalesce(ds.dimensions_encountered, array[]::text[]) as dimensions_encountered,
  coalesce(es.evidence_tasks_completed_total, 0) as evidence_tasks_completed_total,
  coalesce(es.decision_count, 0) as decision_count,
  coalesce(es.decisions_after_evidence, 0) as decisions_after_evidence,
  case
    when coalesce(es.decision_count, 0) = 0 then null
    else es.decisions_after_evidence::numeric / es.decision_count
  end as evidence_before_decision_ratio,
  coalesce(es.japan_comparison_exposure, 0) as japan_comparison_exposure,
  coalesce(es.institutional_political_financial_exposure, 0) as institutional_political_financial_exposure,
  case
    when gs.completion_status = 'completed'
      or exists (
        select 1
        from valid_events ve
        where ve.session_id = gs.session_id
          and ve.event_type = 'session_end'
      ) then 1
    else 0
  end as completed_intervention_session
from game_sessions gs
join participants p on p.participant_code = gs.participant_code
left join dimension_summary ds on ds.session_id = gs.session_id
left join event_summary es on es.session_id = gs.session_id
where p.consent_status = 'included';

-- Assessment/scores export: will be sparse until approved instruments and coding are entered.
create or replace view research_assessment_scores_export as
select
  rs.participant_code,
  p.class_id,
  p.condition,
  ar.session_id,
  ar.instrument,
  ar.phase,
  ar.instrument_version,
  rs.dimension,
  rs.score,
  rs.rubric_version,
  rs.coder_id,
  rs.response_id,
  rs.coded_at
from research_scores rs
join participants p on p.participant_code = rs.participant_code
left join assessment_responses ar on ar.response_id = rs.response_id
where p.consent_status = 'included';

-- Dashboard overview export: compact monitoring surface.
create or replace view research_dashboard_overview_export as
select
  rss.research_cohort,
  rss.app_version,
  rss.content_map_version,
  rss.condition,
  count(distinct rss.participant_code) as participants_with_sessions,
  count(distinct rss.session_id) as session_count,
  sum(rss.completed_intervention_session) as completed_session_count,
  avg(rce.distinct_complexity_dimensions_encountered) as avg_distinct_complexity_dimensions_encountered,
  percentile_cont(0.5) within group (
    order by rce.distinct_complexity_dimensions_encountered
  ) as median_distinct_complexity_dimensions_encountered,
  avg(rce.evidence_tasks_completed_total) as avg_evidence_tasks_completed_total,
  avg(rce.evidence_before_decision_ratio) as avg_evidence_before_decision_ratio,
  count(*) filter (where rce.japan_comparison_exposure > 0) as participants_or_sessions_with_japan_comparison_exposure,
  count(*) filter (where rce.institutional_political_financial_exposure > 0) as participants_or_sessions_with_institutional_political_financial_exposure
from research_session_summary_export rss
left join research_complexity_exposure_export rce
  on rce.session_id = rss.session_id
where rss.consent_status = 'included'
group by
  rss.research_cohort,
  rss.app_version,
  rss.content_map_version,
  rss.condition;

-- Privacy exception export: dashboard/table should normally be empty.
create or replace view research_privacy_exception_export as
select
  log_id,
  participant_code,
  session_id,
  event_type,
  payload
from event_logs
where payload ?| array[
  'choice_label',
  'response_text',
  'name',
  'real_name',
  'name_to_code',
  'student_id',
  'email',
  'phone',
  'notes'
];
