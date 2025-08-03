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

// Optimisation des écouteurs d'événements
require('events').EventEmitter.defaultMaxListeners = 100;

// Import des routes
const qrRouter = require('./routes/qr');
const pairRouter = require('./routes/pair');

// Routes API
app.use('/server', qrRouter);    // Pour les QR codes
app.use('/code', pairRouter);    // Pour les pairing codes

// Routes HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'public', 'index.html'));
});

app.get('/qr', (req, res) => {
    res.sendFile(path.join(__path, 'public', 'qr.html'));
});

app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'public', 'pair.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(`[PATERSON-MD] Error: ${err.message}`);
    res.status(500).json({ 
        status: 'error',
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack
    });
});

// Gestion 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__path, 'public', '404.html'));
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   PATERSON-MD Running on port: ${PORT}   ║
  ║                                          ║
  ║   ➜ Local: http://localhost:${PORT}     ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  
  GitHub: https://github.com/PATERSON-MD/PATERSON-MD
  WhatsApp Channel: https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20
  `);
});

// Arrêt gracieux
process.on('SIGINT', () => {
    console.log('[PATERSON-MD] Shutting down gracefully...');
    server.close(() => {
        console.log('[PATERSON-MD] Server closed.');
        process.exit(0);
    });
});

module.exports = app;
