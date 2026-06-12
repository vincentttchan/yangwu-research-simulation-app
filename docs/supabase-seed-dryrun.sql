-- Dry-run seed data for Task 10 environment setup.
-- This file uses pseudonymous participant codes only.
-- Do not add direct personal identifiers or name-to-code linkage to this file.

insert into participants (
  participant_code,
  session_code,
  class_id,
  condition,
  consent_status,
  notes
) values
  ('YW-001', 'LKKC-2026-DRYRUN', 'LKKC-S4A', 'scaffolded', 'included', 'dry-run only'),
  ('YW-002', 'LKKC-2026-DRYRUN', 'LKKC-S4B', 'standard', 'included', 'dry-run only'),
  ('YW-999', 'LKKC-2026-DRYRUN', 'LKKC-TEST', 'standard', 'excluded', 'dry-run excluded case')
on conflict (participant_code) do update set
  session_code = excluded.session_code,
  class_id = excluded.class_id,
  condition = excluded.condition,
  consent_status = excluded.consent_status,
  notes = excluded.notes;
