const express = require('express');
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

// 1. Vérification des dépendances
try {
  require.resolve('express');
  require.resolve('body-parser');
  require.resolve('@whiskeysockets/baileys');
  require.resolve('qrcode');
  console.log("[OK] Toutes les dépendances sont installées");
} catch (e) {
  console.error("[ERREUR] Dépendance manquante:", e.message);
  process.exit(1);
}

// 2. Vérification des fichiers
const criticalFiles = [
  path.join(__path, 'public', 'index.html'),
  path.join(__path, 'public', 'qr.html'),
  path.join(__path, 'public', 'pair.html'),
  path.join(__path, 'public', '404.html'),
  path.join(__path, 'routes', 'qr.js'),
  path.join(__path, 'routes', 'pair.js'),
  path.join(__path, 'gen-id.js'),
  path.join(__path, 'mega.js')
];

criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`[ERREUR] Fichier manquant: ${file}`);
    process.exit(1);
  }
  console.log(`[OK] Fichier présent: ${path.basename(file)}`);
});
// ===== VÉRIFICATION CRITIQUE - FIN =====

// Import des routes
let qrRouter, pairRouter;
try {
  console.log("[DEBUG] Chargement de ./routes/qr");
  qrRouter = require('./routes/qr');
  console.log("[OK] Route QR chargée");
  
  console.log("[DEBUG] Chargement de ./routes/pair");
  pairRouter = require('./routes/pair');
  console.log("[OK] Route Pair chargée");
} catch (e) {
  console.error("[ERREUR] Chargement des routes:", e);
  process.exit(1);
}

// Routes API
app.use('/server', qrRouter);
app.use('/code', pairRouter);

// ... (le reste de votre code inchangé)

// Démarrage du serveur
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   PATERSON-MD Running on port: ${PORT}   ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});

// ... (gestion SIGTERM inchangée)
