const express = require('express');

const { ApiError } = require('../middleware/errorHandler');
const { extractCrmRecords } = require('../services/extraction.service');

const router = express.Router();

const MAX_ROWS = 2000;

router.post('/', async (req, res, next) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new ApiError(400, 'Request body must include a non-empty "rows" array');
    }
    if (rows.length > MAX_ROWS) {
      throw new ApiError(400, `Too many rows: max ${MAX_ROWS} rows per request`);
    }
    if (!rows.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
      throw new ApiError(400, 'Each row must be an object of column name to value');
    }

    const result = await extractCrmRecords(rows);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
