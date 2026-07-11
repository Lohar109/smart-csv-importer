const { CRM_FIELDS, CRM_STATUS_VALUES, DATA_SOURCE_VALUES, CONFIDENCE_LEVELS } = require('../utils/crmSchema');

function extractJsonBlock(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return text.trim();

  return text.slice(firstBrace, lastBrace + 1);
}

function normalizeFieldConfidence(rawConfidence) {
  const confidence = {};
  const source = rawConfidence && typeof rawConfidence === 'object' ? rawConfidence : {};
  for (const field of CRM_FIELDS) {
    const level = source[field];
    confidence[field] = CONFIDENCE_LEVELS.includes(level) ? level : 'high';
  }
  return confidence;
}

function normalizeRecord(record) {
  const normalized = {};
  for (const field of CRM_FIELDS) {
    const value = record[field];
    normalized[field] = value === null || value === undefined ? '' : String(value);
  }

  if (!CRM_STATUS_VALUES.includes(normalized.crm_status)) {
    normalized.crm_status = '';
  }
  if (!DATA_SOURCE_VALUES.includes(normalized.data_source)) {
    normalized.data_source = '';
  }

  normalized.field_confidence = normalizeFieldConfidence(record.field_confidence);

  return normalized;
}

/**
 * Parses raw LLM text output into { imported, skipped }, tolerating markdown
 * fences and stray text around the JSON payload. Throws if the payload isn't
 * usable JSON so the caller can retry the batch.
 */
function parseExtractionResponse(rawText) {
  const jsonText = extractJsonBlock(rawText);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`LLM response was not valid JSON: ${err.message}`);
  }

  const imported = Array.isArray(parsed.imported) ? parsed.imported.map(normalizeRecord) : [];
  const skipped = Array.isArray(parsed.skipped)
    ? parsed.skipped.map((entry) => ({
        row: entry.row || entry,
        reason: entry.reason || 'Missing both email and mobile number',
      }))
    : [];

  return { imported, skipped };
}

module.exports = { parseExtractionResponse };
