import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const exportDirectory = resolve(
  process.argv[2] || process.env.RESEARCH_EXPORT_DIR || join(root, 'tests', 'fixtures', 'task18-research-export')
);

const disallowedColumns = new Set([
  'name',
  'real_name',
  'name_to_code',
  'student_id',
  'email',
  'phone',
  'notes',
  'choice_label',
  'response_text'
]);

const expectedFiles = {
  'dataset_session_summary.csv': [
    'participant_code',
    'session_id',
    'class_id',
    'condition',
    'consent_status',
    'app_version',
    'research_cohort',
    'content_map_version',
    'device_category',
    'viewport_width',
    'viewport_height',
    'browser_family',
    'started_at',
    'ended_at',
    'completion_status',
    'event_count',
    'first_event_time',
    'last_event_time',
    'completed_intervention_session'
  ],
  'dataset_event_log_long.csv': [
    'participant_code',
    'session_id',
    'class_id',
    'condition',
    'event_type',
    'client_time',
    'server_time',
    'route_id',
    'city_id',
    'event_id',
    'event_kind',
    'source',
    'evidence_task_id',
    'hotspot_id',
    'task_type',
    'choice_id',
    'choice_index',
    'choice_axis',
    'checkpoint_type',
    'checkpoint_correct',
    'attempt_index',
    'constructs',
    'complexity_dimensions',
    'app_version',
    'research_cohort',
    'content_map_version'
  ],
  'dataset_complexity_exposure.csv': [
    'participant_code',
    'session_id',
    'class_id',
    'condition',
    'distinct_complexity_dimensions_encountered',
    'dimensions_encountered',
    'evidence_tasks_completed_total',
    'decision_count',
    'decisions_after_evidence',
    'evidence_before_decision_ratio',
    'japan_comparison_exposure',
    'institutional_political_financial_exposure',
    'completed_intervention_session'
  ],
  'dataset_assessment_scores.csv': [
    'participant_code',
    'class_id',
    'condition',
    'session_id',
    'instrument',
    'phase',
    'instrument_version',
    'dimension',
    'score',
    'rubric_version',
    'coder_id',
    'response_id',
    'coded_at'
  ],
  'dataset_dashboard_overview.csv': [
    'research_cohort',
    'app_version',
    'content_map_version',
    'condition',
    'participants_with_sessions',
    'session_count',
    'completed_session_count',
    'avg_distinct_complexity_dimensions_encountered',
    'median_distinct_complexity_dimensions_encountered',
    'avg_evidence_tasks_completed_total',
    'avg_evidence_before_decision_ratio',
    'participants_or_sessions_with_japan_comparison_exposure',
    [
      'participants_or_sessions_with_institutional_political_financial_exposure',
      'participants_or_sessions_with_institutional_political_financial'
    ]
  ],
  'dataset_privacy_exceptions.csv': [
    'log_id',
    'participant_code',
    'session_id',
    'event_type',
    'payload'
  ]
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  if (inQuotes) {
    throw new Error('CSV parse error: unclosed quoted field');
  }

  return rows;
}

function normalizeHeader(value) {
  return value.trim().replace(/^\uFEFF/, '');
}

function rowsToObjects(rows) {
  if (rows.length === 0) {
    return { headers: [], records: [] };
  }

  const headers = rows[0].map(normalizeHeader);
  const records = rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
  return { headers, records };
}

function assertRequiredColumns(fileName, headers, requiredColumns) {
  requiredColumns.forEach((column) => {
    if (Array.isArray(column)) {
      assert.ok(headers.some((header) => column.includes(header)), `${fileName} missing required column variant: ${column.join(' or ')}`);
      return;
    }
    assert.ok(headers.includes(column), `${fileName} missing required column: ${column}`);
  });
}

function assertNoDisallowedColumns(fileName, headers) {
  headers.forEach((header) => {
    assert.equal(disallowedColumns.has(header), false, `${fileName} exports disallowed privacy column: ${header}`);
  });
}

function assertVersionFields(fileName, records) {
  const versionFields = ['app_version', 'research_cohort', 'content_map_version'];
  records.forEach((record, index) => {
    versionFields.forEach((field) => {
      if (field in record) {
        assert.notEqual(record[field], '', `${fileName} row ${index + 2} has empty ${field}; check APP_VERSION/cohort/content map export settings`);
      }
    });
  });
}

function validateExportDirectory(directory) {
  assert.equal(existsSync(directory), true, `research CSV export directory does not exist: ${directory}`);

  const summaries = [];

  Object.entries(expectedFiles).forEach(([fileName, requiredColumns]) => {
    const filePath = join(directory, fileName);
    assert.equal(existsSync(filePath), true, `missing export CSV: ${fileName}`);

    const parsed = parseCsv(readFileSync(filePath, 'utf8'));
    const { headers, records } = rowsToObjects(parsed);

    assertRequiredColumns(fileName, headers, requiredColumns);
    assertNoDisallowedColumns(fileName, headers);
    assertVersionFields(fileName, records);

    if (fileName === 'dataset_session_summary.csv') {
      records.forEach((record, index) => {
        assert.equal(record.consent_status, 'included', `${fileName} row ${index + 2} is not consent_status=included`);
      });
    }

    if (fileName === 'dataset_event_log_long.csv') {
      records.forEach((record, index) => {
        assert.notEqual(record.event_type, 'live_dryrun_qa', `${fileName} row ${index + 2} includes live_dryrun_qa`);
      });
    }

    if (fileName === 'dataset_privacy_exceptions.csv') {
      assert.equal(records.length, 0, 'privacy exception export is not empty; resolve payload privacy exception rows before analysis');
    }

    summaries.push(`${fileName}: ${records.length} data row(s)`);
  });

  return summaries;
}

try {
  const summaries = validateExportDirectory(exportDirectory);
  console.log(`research CSV export QA passed for ${exportDirectory}`);
  summaries.forEach((summary) => console.log(`- ${summary}`));
} catch (error) {
  console.error(`research CSV export QA failed for ${exportDirectory}`);
  console.error(error.message);
  process.exitCode = 1;
}

export { parseCsv, validateExportDirectory };
