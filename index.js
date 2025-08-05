const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const __path = __dirname;

// Configuration
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__path, 'public')));

// Augmentation limite listeners
require('events').EventEmitter.defaultMaxListeners = 100;

// DEBUG: Vérification des fichiers
console.log("[DEBUG] Chemin du projet:", __path);

// Vérification des fichiers critiques
console.log("[INIT] Vérification des fichiers critiques...");
const requiredFiles = [
    path.join(__path, 'public', 'index.html'),
    path.join(__path, 'public', 'qr.html'),
    path.join(__path, 'public', 'pair.html'),
    path.join(__path, 'public', '404.html')
];

requiredFiles.forEach(file => {
    try {
        fs.accessSync(file);
        console.log(`[OK] Fichier présent: ${path.basename(file)}`);
    } catch {
        console.error(`[ERREUR CRITIQUE] Fichier manquant: ${file}`);
        process.exit(1);
    }
});

// Vérification des routes
let qrRouter, pairRouter;
try {
    console.log("[DEBUG] Chargement des routes...");
    qrRouter = require('./routes/qr');
    pairRouter = require('./routes/pair');
    console.log("[SUCCESS] Routes chargées");
} catch (e) {
    console.error("[CRITICAL] Erreur de chargement des routes:", e);
    process.exit(1);
}

// Routes API
app.use('/server', qrRouter);
app.use('/code', pairRouter);

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

// Gestion 404 (TOUJOURS EN DERNIER)
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

// Arrêt gracieux
process.on('SIGTERM', () => {
    console.log('[PATERSON-MD] Extinction...');
    server.close(() => process.exit(0));
});const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs'); // Ajout crucial
const app = express();

// Gestion des erreurs non capturées - À METTRE EN TOUTE PREMIÈRE LIGNE
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Configuration
const PORT = process.env.PORT || 5000;
const __path = process.cwd();

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__path, 'public')));

// Optimisation des écouteurs d'événements
require('events').EventEmitter.defaultMaxListeners = 100;

// ===== VÉRIFICATION CRITIQUE - DÉBUT =====
console.log("[INIT] Démarrage des vérifications...");

