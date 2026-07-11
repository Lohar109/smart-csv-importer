const express = require('express');

const upload = require('../middleware/uploadMiddleware');
const { ApiError } = require('../middleware/errorHandler');
const { parseCsvBuffer } = require('../services/csvParser.service');

const router = express.Router();

const PREVIEW_ROW_LIMIT = 50;

router.post('/', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded. Attach a CSV file under field "file".');
    }

    const { headers, rows } = parseCsvBuffer(req.file.buffer);

    res.json({
      headers,
      preview: rows.slice(0, PREVIEW_ROW_LIMIT),
      totalRows: rows.length,
      rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
