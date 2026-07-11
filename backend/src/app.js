const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const uploadRoutes = require('./routes/upload.routes');
const extractRoutes = require('./routes/extract.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/extract', extractRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
