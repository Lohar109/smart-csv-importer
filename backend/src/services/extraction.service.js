const { getLlmProvider } = require('./llm/llmProviderFactory');
const { buildExtractionPrompt } = require('./promptBuilder');
const { parseExtractionResponse } = require('./responseParser');

const BATCH_SIZE = 20;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function chunkRows(rows, size) {
  const batches = [];
  for (let i = 0; i < rows.length; i += size) {
    batches.push(rows.slice(i, i + size));
  }
  return batches;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractBatchWithRetry(batch, provider) {
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const prompt = buildExtractionPrompt(batch);
      const rawText = await provider.generate(prompt);
      return parseExtractionResponse(rawText);
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  // All retries exhausted: skip every row in this batch rather than failing the whole import.
  return {
    imported: [],
    skipped: batch.map((row) => ({
      row,
      reason: `AI extraction failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`,
    })),
  };
}

/**
 * Splits rows into batches, runs each through the LLM extraction prompt
 * (with retry on failure), and combines the results.
 */
async function extractCrmRecords(rows) {
  const provider = getLlmProvider();
  const batches = chunkRows(rows, BATCH_SIZE);

  const results = await Promise.all(batches.map((batch) => extractBatchWithRetry(batch, provider)));

  const imported = [];
  const skipped = [];
  for (const result of results) {
    imported.push(...result.imported);
    skipped.push(...result.skipped);
  }

  return {
    imported,
    skipped,
    totalImported: imported.length,
    totalSkipped: skipped.length,
  };
}

module.exports = { extractCrmRecords, BATCH_SIZE };
