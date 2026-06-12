export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { session, events } = request.body || {};

  if (!session?.session_id || !session?.participant_code || !Array.isArray(events)) {
    response.status(400).json({ error: 'invalid_log_batch' });
    return;
  }

  response.status(501).json({
    error: 'supabase_not_connected',
    message: 'Log batch API shape is prepared; Supabase insert is added in the backend connection sprint.',
    accepted_shape: {
      session_id: session.session_id,
      participant_code: session.participant_code,
      event_count: events.length
    }
  });
}
