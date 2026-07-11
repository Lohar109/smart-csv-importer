const express = require('express');

const { ApiError } = require('../middleware/errorHandler');
const { extractCrmRecords } = require('../services/extraction.service');

const router = express.Router();

const MAX_ROWS = 2000;

function validateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ApiError(400, 'Request body must include a non-empty "rows" array');
  }
  if (rows.length > MAX_ROWS) {
    throw new ApiError(400, `Too many rows: max ${MAX_ROWS} rows per request`);
  }
  if (!rows.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
    throw new ApiError(400, 'Each row must be an object of column name to value');
  }
}

router.post('/', async (req, res, next) => {
  try {
    const { rows } = req.body;
    validateRows(rows);

    const result = await extractCrmRecords(rows);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * Same extraction as POST /, but streams progress over Server-Sent Events
 * so the frontend can show a live "batch N of M" progress bar. Uses a plain
 * POST (not EventSource, which can't send a body) — the frontend reads the
 * response body as a stream and parses SSE frames itself.
 */
router.post('/stream', async (req, res, next) => {
  try {
    const { rows } = req.body;
    validateRows(rows);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
      const result = await extractCrmRecords(rows, {
        onBatchComplete: (progress) => sendEvent({ type: 'batch_complete', ...progress }),
      });
      sendEvent({ type: 'done', ...result });
    } catch (err) {
      sendEvent({ type: 'error', message: err.message || 'Extraction failed' });
    } finally {
      res.end();
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
