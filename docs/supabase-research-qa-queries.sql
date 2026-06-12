-- Task 16 Supabase Research Dataset QA Queries
-- Run in the Supabase SQL editor after a dry-run or pilot session.
-- These queries are read-only checks unless you explicitly adapt them for export.

-- 1. Session and event volume by participant.
select
  gs.participant_code,
  count(distinct gs.session_id) as session_count,
  count(el.log_id) as event_count,
  min(gs.started_at) as first_session_started_at,
  max(el.server_time) as last_event_server_time
from game_sessions gs
left join event_logs el on el.session_id = gs.session_id
group by gs.participant_code
order by gs.participant_code;

-- 2. Event type coverage. Expect Task 15 dry-run to include live_dryrun_qa;
-- real gameplay should include session_start, city_entered, evidence_task_completed,
-- event_opened, decision_selected, and session_end when fully played.
select
  event_type,
  count(*) as event_count,
  count(distinct participant_code) as participant_count
from event_logs
group by event_type
order by event_count desc, event_type;

-- 3. Privacy QA: payload should not contain prose, personal data, or matching-list fields.
select
  log_id,
  participant_code,
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

-- 4. Version QA: analysis should normally filter to one app/content version.
select
  app_version,
  research_cohort,
  content_map_version,
  count(*) as event_count
from event_logs
group by app_version, research_cohort, content_map_version
order by event_count desc;

-- 5. Dimension coverage by participant/session.
with expanded as (
  select
    participant_code,
    session_id,
    unnest(complexity_dimensions) as complexity_dimension
  from event_logs
)
select
  participant_code,
  session_id,
  count(distinct complexity_dimension) as distinct_complexity_dimensions_encountered,
  array_agg(distinct complexity_dimension order by complexity_dimension) as dimensions_encountered
from expanded
group by participant_code, session_id
order by participant_code, session_id;

-- 6. Derived indicator sketch: evidence_tasks_completed_total.
select
  participant_code,
  session_id,
  count(*) filter (where event_type = 'evidence_task_completed') as evidence_tasks_completed_total
from event_logs
group by participant_code, session_id
order by participant_code, session_id;

-- 7. Derived indicator sketch: evidence_before_decision_ratio.
with ordered_events as (
  select
    log_id,
    participant_code,
    session_id,
    event_type,
    coalesce(client_time, server_time) as event_time,
    count(*) filter (where event_type = 'evidence_task_completed') over (
      partition by session_id
      order by coalesce(client_time, server_time), server_time, log_id
      rows between unbounded preceding and 1 preceding
    ) as prior_evidence_count
  from event_logs
),
decision_summary as (
  select
    participant_code,
    session_id,
    count(*) filter (where event_type = 'decision_selected') as decision_count,
    count(*) filter (
      where event_type = 'decision_selected'
        and prior_evidence_count > 0
    ) as decisions_after_evidence
  from ordered_events
  group by participant_code, session_id
)
select
  participant_code,
  session_id,
  decision_count,
  decisions_after_evidence,
  case
    when decision_count = 0 then null
    else decisions_after_evidence::numeric / decision_count
  end as evidence_before_decision_ratio
from decision_summary
order by participant_code, session_id;

-- 8. Derived indicator sketch: japan_comparison_exposure.
select
  participant_code,
  session_id,
  count(*) filter (where 'japan_comparison' = any(complexity_dimensions)) as japan_comparison_exposure,
  bool_or('japan_comparison' = any(complexity_dimensions)) as has_japan_comparison_exposure
from event_logs
group by participant_code, session_id
order by participant_code, session_id;

-- 9. Derived indicator sketch: institutional_political_financial_exposure.
select
  participant_code,
  session_id,
  count(*) filter (
    where complexity_dimensions && array['institutions', 'court_politics', 'finance']::text[]
  ) as institutional_political_financial_exposure,
  bool_or(complexity_dimensions && array['institutions', 'court_politics', 'finance']::text[]) as has_institutional_political_financial_exposure
from event_logs
group by participant_code, session_id
order by participant_code, session_id;

-- 10. Derived indicator sketch: completed_intervention_session.
select
  gs.participant_code,
  gs.session_id,
  gs.completion_status,
  bool_or(el.event_type = 'session_end') as has_session_end_event,
  case
    when gs.completion_status = 'completed' or bool_or(el.event_type = 'session_end') then 1
    else 0
  end as completed_intervention_session
from game_sessions gs
left join event_logs el on el.session_id = gs.session_id
group by gs.participant_code, gs.session_id, gs.completion_status
order by gs.participant_code, gs.session_id;

-- 11. Participant/session referential integrity QA.
select
  el.log_id,
  el.participant_code as event_participant_code,
  gs.participant_code as session_participant_code
from event_logs el
left join game_sessions gs on gs.session_id = el.session_id
where gs.session_id is null
   or el.participant_code <> gs.participant_code;

-- 12. Consent QA: event logs should only belong to included participants in dry-run/pilot analysis.
select
  el.log_id,
  el.participant_code,
  p.consent_status
from event_logs el
left join participants p on p.participant_code = el.participant_code
where p.participant_code is null
   or p.consent_status <> 'included';
