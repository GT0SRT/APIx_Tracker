require('dotenv').config();
const express = require('express');
const cors = require('cors');

const analyticsRoutes = require('./src/routes/analyticsRoutes');
const logsRoutes = require('./src/routes/logsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/logs', logsRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
