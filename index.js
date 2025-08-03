const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const __path = process.cwd();

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__path, 'public')));

// Event listener optimization
require('events').EventEmitter.defaultMaxListeners = 100;

// Routes
const routes = [
  { path: '/server', handler: require('./routes/qr') },
  { path: '/code', handler: require('./routes/pair') }
];

routes.forEach(route => {
  app.use(route.path, route.handler);
});

// HTML Routes
const htmlRoutes = [
  { url: '/', file: 'index.html' },
  { url: '/pair', file: 'pair.html' },
  { url: '/qr', file: 'qr.html' }
];

htmlRoutes.forEach(route => {
  app.get(route.url, (req, res) => {
    res.sendFile(path.join(__path, 'public', route.file));
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[PATERSON-MD] Error: ${err.message}`);
  res.status(500).json({ 
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__path, 'public', '404.html'));
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   PATERSON-MD Running on port: ${PORT}   ║
  ║                                          ║
  ║   ➜ Local: http://localhost:${PORT}     ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  
  Don't forget to star our GitHub repository!
  https://github.com/PATERSON-MD/PATERSON-MD
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[PATERSON-MD] Shutting down gracefully...');
  server.close(() => {
    console.log('[PATERSON-MD] Server closed.');
    process.exit(0);
  });
});

// Export for testing
module.exports = app;
