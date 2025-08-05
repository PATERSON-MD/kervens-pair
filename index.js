const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const __path = __dirname;
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__path, 'public')));

// Augmentation limite des écouteurs
require('events').EventEmitter.defaultMaxListeners = 100;

// Vérification des fichiers critiques
console.log("[INIT] Vérification des fichiers...");
const requiredFiles = ['index.html', 'qr.html', 'pair.html', '404.html'];
requiredFiles.forEach(file => {
    const filePath = path.join(__path, 'public', file);
    if (fs.existsSync(filePath)) {
        console.log(`[OK] ${file}`);
    } else {
        console.error(`[MISSING] ${file}`);
        if (file === '404.html') {
            fs.writeFileSync(filePath, '<h1>404 Not Found</h1><a href="/">Home</a>');
            console.log(`[CREATED] ${file}`);
        }
    }
});

// Chargement des routes
try {
    console.log("[INIT] Chargement des routes...");
    const qrRouter = require('./routes/qr');
    const pairRouter = require('./routes/pair');
    
    app.use('/server', qrRouter);
    app.use('/code', pairRouter);
    console.log("[SUCCESS] Routes chargées");
} catch (e) {
    console.error("[CRITICAL] Erreur de chargement des routes:", e);
    setTimeout(() => process.exit(1), 1000);
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
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// Gestion 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__path, 'public', '404.html'));
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║   PATERSON-MD Running on port ${PORT}   ║
  ║                                      ║
  ║   ➜ http://localhost:${PORT}         ║
  ║                                      ║
  ╚══════════════════════════════════════╝
  `);
});
