const { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } = require('../utils/crmSchema');

/**
 * Builds the instruction prompt sent to the LLM for a single batch of raw CSV rows.
 * The LLM must map arbitrary source columns onto the fixed CRM schema.
 */
function buildExtractionPrompt(rows) {
  return `You are a data extraction engine for a CRM system. You will receive an array of raw CSV rows exported from an unknown source (could be Facebook Lead Ads, Google Ads, Excel, a real-estate CRM, a sales report, or a manually created spreadsheet). Column names and layouts vary and are NOT known in advance.

Your job: map each raw row onto this exact CRM schema and return structured JSON. Do not invent a schema of your own — use exactly these field names:

created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

RULES (follow exactly):
1. "crm_status" must be one of exactly: ${CRM_STATUS_VALUES.join(', ')}. If it is unclear which one applies, leave it as an empty string.
2. "data_source" must be one of exactly: ${DATA_SOURCE_VALUES.join(', ')}. If none match confidently, leave it as an empty string.
3. "created_at" must be a value parseable by JavaScript's \`new Date(...)\`. If no date is present, leave it as an empty string.
4. "crm_note" holds: remarks, follow-up notes, extra comments, extra phone numbers, extra emails, and any other info that does not fit another field.
5. If multiple emails exist in a row, use the first as "email" and append the rest to "crm_note". Apply the same rule for multiple mobile numbers (first goes to "mobile_without_country_code", rest appended to "crm_note").
6. Each output record must remain a single JSON value per field — no unintended line breaks. Escape any necessary line breaks as \\n.
7. Skip a record entirely (do not include it in "imported") if it has NEITHER an email NOR a mobile number. Instead add it to "skipped" with the original row data and a short "reason" string.
8. "mobile_without_country_code" should contain digits only, with the country's dialing code stripped out and placed in "country_code" (e.g. "+91"). If you cannot confidently separate them, put the full number in "mobile_without_country_code" and leave "country_code" empty.
9. Every field must be present on every imported record, using an empty string "" for anything unknown. Never use null or omit a key.
10. Return ONLY valid JSON, matching this exact shape, with no markdown fences and no commentary:

{
  "imported": [
    { "created_at": "", "name": "", "email": "", "country_code": "", "mobile_without_country_code": "", "company": "", "city": "", "state": "", "country": "", "lead_owner": "", "crm_status": "", "crm_note": "", "data_source": "", "possession_time": "", "description": "" }
  ],
  "skipped": [
    { "row": {}, "reason": "" }
  ]
}

Here are the raw CSV rows to process (as JSON):
${JSON.stringify(rows)}`;
}

module.exports = { buildExtractionPrompt };
