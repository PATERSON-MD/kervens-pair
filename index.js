require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const helmet = require('helmet'); // Sécurisation des en-têtes
const compression = require('compression'); // Compression des réponses
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const logger = require('./utils/logger'); // Logger personnalisé
const { makeid } = require('./utils/gen-id'); // Déplacé dans un dossier utils

const app = express();
const __path = __dirname;
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Configuration du clustering
if (isProduction && cluster.isMaster) {
  logger.info(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < Math.min(numCPUs, 4); i++) { // Max 4 workers
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Middlewares
  app.use(helmet()); // Sécurisation des en-têtes
  app.use(compression()); // Compression des réponses
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.static(path.join(__path, 'public')));

  // Augmentation limite des écouteurs
  require('events').EventEmitter.defaultMaxListeners = 100;

  // Vérification des fichiers critiques
  logger.info("Vérification des fichiers...");
  const requiredFiles = [
    'utils/gen-id.js',
    'public/index.html',
    'public/qr.html',
    'public/pair.html',
    'public/404.html'
  ];

  requiredFiles.forEach(file => {
    const filePath = path.join(__path, file);
    
    if (fs.existsSync(filePath)) {
      logger.info(`[OK] ${file}`);
    } else {
      logger.error(`[MISSING] ${file}`);
      
      // Création automatique du fichier 404.html si manquant
      if (file === 'public/404.html') {
        try {
          const content = `
<!DOCTYPE html>
<html>
<head>
    <title>404 Not Found</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #ff0000; }
        a { color: #0066cc; text-decoration: none; }
    </style>
</head>
<body>
    <h1>404 Error</h1>
    <p>Page not found</p>
    <p><a href="/">Return to homepage</a></p>
</body>
</html>`;
          fs.writeFileSync(filePath, content);
          logger.info(`[CREATED] ${file}`);
        } catch (e) {
          logger.error(`Failed to create ${file}: ${e.message}`);
        }
      }
    }
  });

  // Chargement des routes
  try {
    logger.info("Chargement des routes...");
    const qrRouter = require('./routes/qr');
    const pairRouter = require('./routes/pair');
    
    app.use('/server', qrRouter);
    app.use('/code', pairRouter);
    logger.info("Routes chargées avec succès");
  } catch (e) {
    logger.error("Erreur de chargement des routes:", e);
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
    logger.error(`Erreur: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: isProduction ? {} : err.message
    });
  });

  // Gestion 404
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__path, 'public', '404.html'));
  });

  // Démarrage du serveur
  const server = app.listen(PORT, '0.0.0.0', () => {
    const address = server.address();
    logger.info(`
  ╔══════════════════════════════════════╗
  ║                                      ║
  ║   PATERSON-MD Running on port ${PORT}   ║
  ║                                      ║
  ║   ➜ http://localhost:${PORT}         ║
  ║                                      ║
  ╚══════════════════════════════════════╝
  
  GitHub: https://github.com/PATERSON-MD/PATERSON-MD
  WhatsApp Channel: https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20
  `);
  });

  // Gestion des erreurs non capturées
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`, err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
  });
        }
