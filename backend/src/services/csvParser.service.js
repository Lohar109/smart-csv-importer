const { parse } = require('csv-parse/sync');

const { ApiError } = require('../middleware/errorHandler');

/**
 * Parses a CSV buffer into headers + row objects.
 * Does not assume any fixed column names — headers are read from the file itself.
 */
function parseCsvBuffer(buffer) {
  let records;
  try {
    records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    });
  } catch (err) {
    throw new ApiError(400, `Failed to parse CSV: ${err.message}`);
  }

  if (records.length === 0) {
    throw new ApiError(400, 'CSV file contains no data rows');
  }

  const headers = Object.keys(records[0]);

  return { headers, rows: records };
}

module.exports = { parseCsvBuffer };
