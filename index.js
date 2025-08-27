console.log('Démarrage de l\'application PATERSON-MD...');
console.log('Version Node:', process.version);

// Import des modules nécessaires
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de base
app.use(express.json());
app.use(express.static('public'));

// Route principale
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>PATERSON-MD</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #2c5282; }
        .status { padding: 10px; background: #f0fff4; border-radius: 5px; margin: 20px; }
      </style>
    </head>
    <body>
      <h1>PATERSON-MD</h1>
      <div class="status">Serveur démarré avec succès sur le port ${PORT}</div>
      <p>Créé par Kervens Aubourg</p>
    </body>
    </html>
  `);
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
