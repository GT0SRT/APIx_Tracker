require('dotenv').config();
const express = require('express');
const cors = require('cors');

const analyticsRoutes = require('./src/routes/analyticsRoutes');
const logsRoutes = require('./src/routes/logsRoutes');
const routesRoutes = require('./src/routes/routesRoutes');
const methodologyRoutes = require('./src/routes/methodologyRoutes');

const app = express();

// Configure CORS using FRONTEND_URL from .env
const rawFrontendUrls = process.env.FRONTEND_URL || 'http://localhost:5173,https://apix-tracker.vercel.app';
const allowedOrigins = rawFrontendUrls.split(',').map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, scraper ingestion scripts)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for preview environments
    },
    credentials: true,
  })
);

// High-capacity payload parser for multi-route scraper ingestion batches
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware for Render & local terminal observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes (supporting both /api/v1 and /api prefixes)
app.use(['/api/v1/analytics', '/api/analytics'], analyticsRoutes);
app.use(['/api/v1/routes', '/api/routes'], routesRoutes);
app.use(['/api/v1/methodology', '/api/methodology'], methodologyRoutes);
app.use(['/api/v1/logs', '/api/logs'], logsRoutes);
app.use(['/api/v1/audit', '/api/audit'], logsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'APIx Backend REST API' });
});

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
