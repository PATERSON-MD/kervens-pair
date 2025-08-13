import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import cluster from 'cluster';
import os from 'os';
import logger from './utils/logger.js';
import { makeid } from './utils/gen-id.js';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __path = __dirname;

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Configuration du clustering
if (isProduction && cluster.isPrimary) {
  logger.info(`Primary ${process.pid} is running`);

  const numCPUs = os.cpus().length;
  for (let i = 0; i < Math.min(numCPUs, 4); i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Middlewares
  app.use(helmet());
  app.use(compression());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.static(path.join(__path, 'public')));

  // Augmentation limite des écouteurs
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 100;
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
      
      if (file === 'public/404.html') {
        try {
          const content = `<!DOCTYPE html><html><head>
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
          </body></html>`;
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
    const qrModule = await import('./routes/qr.js');
    const pairModule = await import('./routes/pair.js');
    
    app.use('/server', qrModule.default);
    app.use('/code', pairModule.default);
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
