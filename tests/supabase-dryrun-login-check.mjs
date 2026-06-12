import assert from 'node:assert/strict';

const { resolveLoginResult } = await import('../api/login.js?dryrun-test=' + Date.now());

function createMockSupabase({ participant, participantError = null, sessionError = null }) {
  const calls = {
    participantSelect: null,
    participantEq: [],
    insertedSessions: [],
    sessionSelect: null
  };

  const client = {
    from(table) {
      if (table === 'participants') {
        return {
          select(columns) {
            calls.participantSelect = columns;
            return this;
          },
          eq(column, value) {
            calls.participantEq.push([column, value]);
            return this;
          },
          maybeSingle() {
            return Promise.resolve({ data: participant || null, error: participantError });
          }
        };
      }

      if (table === 'game_sessions') {
        return {
          insert(row) {
            calls.insertedSessions.push(row);
            return this;
          },
          select(columns) {
            calls.sessionSelect = columns;
            return this;
          },
          single() {
            if (sessionError) return Promise.resolve({ data: null, error: sessionError });
            return Promise.resolve({
              data: {
                session_id: 'session-dryrun-001',
                participant_code: rowParticipant(calls),
                app_version: calls.insertedSessions[0]?.app_version || null,
                research_cohort: calls.insertedSessions[0]?.research_cohort || null,
                content_map_version: calls.insertedSessions[0]?.content_map_version || null
              },
              error: null
            });
          }
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }
  };

  return { client, calls };
}

function rowParticipant(calls) {
  return calls.insertedSessions[0]?.participant_code || null;
}

const baseBody = {
  participant_code: ' YW-001 ',
  session_code: ' LKKC-2026-DRYRUN ',
  app_version: 'dev-v0.1',
  research_cohort: 'lkkc-may-june-2026',
  content_map_version: 'content-freeze-lite-v0.1',
  device: {
    category: 'tablet',
    viewport_width: 1024,
    viewport_height: 768,
    browser_family: 'Safari'
  }
};

{
  const result = await resolveLoginResult(baseBody, {
    env: { RESEARCH_BACKEND_ENABLED: 'false' },
    supabase: null
  });

  assert.equal(result.status, 501);
  assert.equal(result.body.error, 'supabase_not_connected');
}

{
  const result = await resolveLoginResult({ participant_code: '', session_code: '' }, {
    env: { RESEARCH_BACKEND_ENABLED: 'dry_run' },
    supabase: null
  });

  assert.equal(result.status, 400);
  assert.equal(result.body.error, 'missing_codes');
}

{
  const { client, calls } = createMockSupabase({
    participant: {
      participant_code: 'YW-001',
      session_code: 'LKKC-2026-DRYRUN',
      class_id: 'LKKC-S4A',
      condition: 'scaffolded',
      consent_status: 'included',
      notes: 'dry-run only'
    }
  });

  const result = await resolveLoginResult(baseBody, {
    env: { RESEARCH_BACKEND_ENABLED: 'dry_run' },
    supabase: client
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.session.session_id, 'session-dryrun-001');
  assert.equal(result.body.session.participant_code, 'YW-001');
  assert.equal(result.body.session.class_id, 'LKKC-S4A');
  assert.equal(result.body.session.condition, 'scaffolded');
  assert.equal(result.body.session.app_version, 'dev-v0.1');
  assert.equal(result.body.session.research_cohort, 'lkkc-may-june-2026');
  assert.equal(result.body.session.content_map_version, 'content-freeze-lite-v0.1');
  assert.equal(Object.hasOwn(result.body.session, 'session_code'), false);
  assert.equal(Object.hasOwn(result.body.session, 'notes'), false);

  assert.deepEqual(calls.participantEq, [
    ['participant_code', 'YW-001'],
    ['session_code', 'LKKC-2026-DRYRUN']
  ]);
  assert.equal(calls.insertedSessions.length, 1);
  assert.equal(calls.insertedSessions[0].participant_code, 'YW-001');
  assert.equal(calls.insertedSessions[0].device_category, 'tablet');
  assert.equal(calls.insertedSessions[0].viewport_width, 1024);
}

{
  const { client, calls } = createMockSupabase({
    participant: {
      participant_code: 'YW-999',
      session_code: 'LKKC-2026-DRYRUN',
      class_id: 'LKKC-TEST',
      condition: 'standard',
      consent_status: 'excluded',
      notes: 'dry-run excluded case'
    }
  });

  const result = await resolveLoginResult({
    ...baseBody,
    participant_code: 'YW-999'
  }, {
    env: { RESEARCH_BACKEND_ENABLED: 'dry_run' },
    supabase: client
  });

  assert.equal(result.status, 403);
  assert.equal(result.body.error, 'invalid_or_excluded_participant');
  assert.equal(calls.insertedSessions.length, 0);
}

{
  const { client } = createMockSupabase({ participant: null });
  const result = await resolveLoginResult(baseBody, {
    env: { RESEARCH_BACKEND_ENABLED: 'dry_run' },
    supabase: client
  });

  assert.equal(result.status, 403);
  assert.equal(result.body.error, 'invalid_or_excluded_participant');
}

console.log('supabase dry-run login checks passed');
