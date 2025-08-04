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

// DEBUG: Vérification des fichiers critiques
const fs = require('fs');
console.log("[DEBUG] Vérification des routes...");

try {
    // Import des routes avec vérification
    console.log("[DEBUG] Chargement de ./routes/qr");
    const qrRouter = require('./routes/qr');
    console.log("[SUCCESS] Route QR chargée");
    
    console.log("[DEBUG] Chargement de ./routes/pair");
    const pairRouter = require('./routes/pair');
    console.log("[SUCCESS] Route Pair chargée");
    
    // Routes API
    app.use('/server', qrRouter);    // Pour les QR codes
    app.use('/code', pairRouter);    // Pour les pairing codes
    
} catch (e) {
    console.error("[CRITICAL] Erreur de chargement des routes:", e);
    process.exit(1);
}

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
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const __path = __dirname; // Correction: utilisation de __dirname

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__path, 'public'))); // Maintenant basé sur __dirname

// Optimisation des écouteurs d'événements
require('events').EventEmitter.defaultMaxListeners = 100;

// DEBUG: Vérification des fichiers critiques
const fs = require('fs');
console.log("[DEBUG] Vérification des routes...");
console.log("[DEBUG] Chemin du projet: ", __path);

try {
    // Import des routes avec vérification
    console.log("[DEBUG] Chargement de ./routes/qr");
    const qrRouter = require('./routes/qr');
    console.log("[SUCCESS] Route QR chargée");
    
    console.log("[DEBUG] Chargement de ./routes/pair");
    const pairRouter = require('./routes/pair');
    console.log("[SUCCESS] Route Pair chargée");
    
    // Routes API
    app.use('/server', qrRouter);    // Pour les QR codes
    app.use('/code', pairRouter);    // Pour les pairing codes
    
} catch (e) {
    console.error("[CRITICAL] Erreur de chargement des routes:", e);
    process.exit(1);
}

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
const server = app.listen(PORT, '0.0.0.0', () => {
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

// Arrêt gracieux (important pour Render)
process.on('SIGTERM', () => {
    console.log('[PATERSON-MD] Received SIGTERM. Shutting down gracefully...');
    server.close(() => {
        console.log('[PATERSON-MD] Server closed.');
    });
});
    });
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

// DEBUG: Vérification des fichiers critiques
const fs = require('fs');
console.log("[DEBUG] Vérification des routes...");

try {
    // Import des routes avec vérification
    console.log("[DEBUG] Chargement de ./routes/qr");
    const qrRouter = require('./routes/qr');
    console.log("[SUCCESS] Route QR chargée");
    
    console.log("[DEBUG] Chargement de ./routes/pair");
    const pairRouter = require('./routes/pair');
    console.log("[SUCCESS] Route Pair chargée");
    
    // Routes API
    app.use('/server', qrRouter);    // Pour les QR codes
    app.use('/code', pairRouter);    // Pour les pairing codes
    
} catch (e) {
    console.error("[CRITICAL] Erreur de chargement des routes:", e);
    process.exit(1);
}

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

