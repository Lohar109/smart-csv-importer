const multer = require('multer');

const { ApiError } = require('./errorHandler');

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const isCsv =
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.originalname.toLowerCase().endsWith('.csv');

  if (!isCsv) {
    cb(new ApiError(400, 'Only CSV files are allowed'));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

module.exports = upload;
