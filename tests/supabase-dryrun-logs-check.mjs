import assert from 'node:assert/strict';

const { resolveLogBatchResult } = await import('../api/logs-batch.js?logs-test=' + Date.now());

function createMockSupabase({ insertError = null } = {}) {
  const calls = {
    insertedLogs: []
  };

  const client = {
    from(table) {
      assert.equal(table, 'event_logs');
      return {
        insert(rows) {
          calls.insertedLogs.push(...rows);
          return this;
        },
        select(columns) {
          calls.selectColumns = columns;
          return Promise.resolve({
            data: calls.insertedLogs.map((_, index) => ({ log_id: `log-${index + 1}` })),
            error: insertError
          });
        }
      };
    }
  };

  return { client, calls };
}

const session = {
  session_id: 'session-dryrun-001',
  participant_code: 'YW-001',
  app_version: 'dev-v0.1',
  research_cohort: 'lkkc-may-june-2026',
  content_map_version: 'content-freeze-lite-v0.1'
};

const events = [
  {
    client_event_id: 'client-event-001',
    event_type: 'decision_selected',
    client_time: '2026-06-12T08:00:00.000Z',
    app_version: 'dev-v0.1',
    research_cohort: 'lkkc-may-june-2026',
    payload: {
      route_id: 'lihongzhang',
      city_id: 'shanghai',
      event_id: 'e_jiangnan',
      choice_id: 'a',
      choice_index: 0,
      choice_axis: 'material',
      constructs: ['evidence_use', 'historical_complexity', 'evidence_use'],
      complexity_dimensions: ['technology', 'institutions'],
      choice_label: 'This visible prose must not be stored',
      response_text: 'A student free-text answer must not be stored'
    }
  }
];

{
  const result = await resolveLogBatchResult({ session, events }, {
    env: { RESEARCH_BACKEND_ENABLED: 'false' },
    supabase: null
  });

  assert.equal(result.status, 501);
  assert.equal(result.body.error, 'supabase_not_connected');
}

{
  const result = await resolveLogBatchResult({ session: {}, events: [] }, {
    env: { RESEARCH_BACKEND_ENABLED: 'dry_run' },
    supabase: null
  });

  assert.equal(result.status, 400);
  assert.equal(result.body.error, 'invalid_log_batch');
}

{
  const { client, calls } = createMockSupabase();
  const result = await resolveLogBatchResult({ session, events: [] }, {
    env: { RESEARCH_BACKEND_ENABLED: 'dry_run' },
    supabase: client
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.inserted_count, 0);
  assert.equal(calls.insertedLogs.length, 0);
}

{
  const { client, calls } = createMockSupabase();
  const result = await resolveLogBatchResult({ session, events }, {
    env: { RESEARCH_BACKEND_ENABLED: 'dry_run' },
    supabase: client
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.inserted_count, 1);
  assert.equal(calls.insertedLogs.length, 1);

  const [row] = calls.insertedLogs;
  assert.equal(row.session_id, 'session-dryrun-001');
  assert.equal(row.participant_code, 'YW-001');
  assert.equal(row.client_event_id, 'client-event-001');
  assert.equal(row.event_type, 'decision_selected');
  assert.equal(row.app_version, 'dev-v0.1');
  assert.equal(row.research_cohort, 'lkkc-may-june-2026');
  assert.equal(row.content_map_version, 'content-freeze-lite-v0.1');
  assert.deepEqual(row.constructs, ['evidence_use', 'historical_complexity']);
  assert.deepEqual(row.complexity_dimensions, ['technology', 'institutions']);
  assert.equal(row.payload.choice_id, 'a');
  assert.equal(row.payload.choice_index, 0);
  assert.equal(row.payload.choice_label, undefined);
  assert.equal(row.payload.response_text, undefined);
}

{
  const { client } = createMockSupabase({ insertError: { code: '23503', message: 'foreign key violation' } });
  const result = await resolveLogBatchResult({ session, events }, {
    env: { RESEARCH_BACKEND_ENABLED: 'dry_run' },
    supabase: client
  });

  assert.equal(result.status, 503);
  assert.equal(result.body.error, 'backend_unavailable');
}

console.log('supabase dry-run log batch checks passed');
