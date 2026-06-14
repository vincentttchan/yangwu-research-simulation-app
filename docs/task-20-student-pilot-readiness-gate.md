# Task 20 Student Pilot Readiness / Research Freeze Gate

Status: readiness gate and sign-off protocol  
Formal research data collection status: not ready until this gate is completed and signed off

## Purpose

Task 20 converts the working dry-run pipeline into a controlled readiness gate before any real student-facing pilot. It checks whether the app version, research login, Supabase data capture, CSV export workflow, ethics/consent materials, instruments, school logistics, and device experience are sufficiently stable for a limited student pilot.

This task does not collect student data by itself. It does not add new gameplay features, change the Supabase schema, or approve formal research collection automatically.

## Readiness Principle

The pilot can proceed only when the project has four forms of readiness:

1. Research readiness: ethics, consent, instruments, coding plan, and teacher/researcher roles are clear.
2. Technical readiness: login, event logging, Supabase writes, export views, and CSV QA have passed with dry-run data.
3. Content readiness: research-facing IDs, APP_VERSION, content map version, and intervention condition descriptions are stable enough for the pilot period.
4. Classroom readiness: devices, network, timing, backup instructions, and stop/fix procedures are prepared.

## Minimum Entry Conditions

Task 20 should start only after:

- Task 19 has produced at least one dry-run `game_sessions` row and linked `event_logs` rows.
- The six researcher CSV files can be exported or created as header-only files where appropriate.
- `npm run check:research-csv-export -- /path/to/export-folder` can pass on the dry-run export package.
- Privacy QA returns zero rows.
- The deployment intended for pilot use is known and can be opened with `?mode=research`.

If any of these conditions fail, return to Task 19 or the relevant technical sprint before using real students.

## Gate A: Research And Ethics Readiness

Confirm:

- [ ] Student/parent/school consent procedures are approved and ready for use.
- [ ] Participant codes and session codes are prepared without storing the name-to-code matching list in Supabase or the repository.
- [ ] The name-to-code matching list is stored separately in a protected researcher/school file.
- [ ] The study uses pseudonymous participant codes only inside the app and Supabase.
- [ ] The current instruments are ready to administer:
  - Digital Competency Survey
  - Historical Empathy Assessment
  - Historical Narrative Evaluation Task
  - Intervention Tool Description
  - Transfer Task
  - Focus Group Interview Schedule
  - PAQ rubric
- [ ] Written notes, if collected, are handled under the approved research procedure and stored outside the public app repository.
- [ ] The coding plan for HEA, HNET, Transfer Task, and PAQ is clear enough for at least one scorer to apply consistently.

## Gate B: App And Content Freeze Readiness

Confirm:

- [ ] `APP_VERSION` is set to the intended pilot version, not a vague development label.
- [ ] `RESEARCH_COHORT` matches the pilot cohort.
- [ ] `content_map_version` is populated in event rows.
- [ ] Stable research IDs in `docs/research-id-map.md` are not casually renamed during the pilot.
- [ ] The intervention condition and control/comparison condition are documented in the research plan and teacher instructions.
- [ ] Visual polish may continue only if it does not rename IDs, change intervention condition logic, or invalidate the instrument alignment.
- [ ] Any content change during the pilot is recorded in a private change log with date, reason, and expected research impact.

## Gate C: Technical And Data Readiness

Confirm:

- [ ] Research mode appears only with `?mode=research`.
- [ ] Normal non-research gameplay remains accessible without research login.
- [ ] Valid participant/session codes create one or more `game_sessions` rows.
- [ ] Wrong or excluded participant/session codes fail.
- [ ] Gameplay events write to `event_logs` through `POST /api/logs-batch`.
- [ ] Event payloads use allowlisted IDs and metadata only.
- [ ] Event payloads do not include names, student IDs, emails, phone numbers, written responses, visible choice prose, or name-to-code fields.
- [ ] `live_dryrun_qa` rows are excluded from formal researcher exports.
- [ ] `research_privacy_exception_export` returns zero data rows.
- [ ] CSV export QA passes on the latest dry-run or pilot rehearsal export folder.
- [ ] Vercel environment variables are set for the intended environment only.
- [ ] Supabase secret keys remain server-side and are not exposed through frontend code.

## Gate D: Device And Classroom Readiness

Confirm:

- [ ] The pilot URL opens on school Wi-Fi or the intended network.
- [ ] The game is playable on iPad Safari or Chrome.
- [ ] The game is playable on common student phones in portrait and landscape where relevant.
- [ ] Map layout, event modal height, login screen, and main decision controls are usable on small screens.
- [ ] Audio and large images do not block core gameplay if they load slowly.
- [ ] Students have a fallback instruction if a device disconnects or refreshes.
- [ ] The teacher/researcher has a paper or verbal backup route if the website is unavailable.

## Gate E: Researcher Export And Monitoring Readiness

Confirm:

- [ ] The researcher knows how to export all six CSV files from Supabase.
- [ ] Header-only CSV handling is understood for empty assessment or privacy views.
- [ ] The CSV export folder naming convention is decided privately.
- [ ] The researcher has a secure local location for CSV files.
- [ ] The researcher knows that event counts are engagement/exposure indicators, not direct evidence of learning gains.
- [ ] Outcome claims will rely on scored HEA, HNET, Transfer Task, PAQ, and qualitative evidence where appropriate.

## Stop / Fix Conditions

Do not proceed with a student pilot if:

- real student identifiers appear in Supabase event/session/export data;
- the name-to-code matching list is uploaded to Supabase or committed to Git;
- login accepts an excluded code or wrong session code;
- privacy QA returns one or more rows;
- CSV QA fails;
- event rows are not linked to valid sessions;
- the pilot deployment has an unknown or wrong `APP_VERSION`;
- students cannot use the game reliably on the intended devices;
- consent materials or instrument instructions are not ready.

## Recommended Task 20 Output

Complete `docs/task-20-student-pilot-readiness-signoff-template.md` after the final dry-run and before using real students.

The output should record:

- pilot deployment URL;
- Supabase project label;
- app/content/cohort versions;
- dry-run evidence reviewed;
- CSV export QA result;
- privacy QA result;
- device QA result;
- unresolved issues;
- decision: `approved for limited pilot`, `approved with conditions`, or `not approved`.

## Interpretation Boundary

Passing Task 20 means the project is ready for a limited student-facing pilot under the agreed school and research procedures. It does not mean the study has already produced findings, and it does not permit broader deployment beyond the approved context.
