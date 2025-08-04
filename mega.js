const Mega = require('megajs').default;
const fs = require('fs');
const path = require('path');

// Utilisation des variables d'environnement pour plus de sécurité
const credentials = {
  email: process.env.MEGA_EMAIL || 'romeochefbratva200k@gmail.com',
  password: process.env.MEGA_PASSWORD || 'UMP-MP5-MP40',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// Créer le dossier temp s'il n'existe pas
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function upload(fileStream, filename) {
  return new Promise((resolve, reject) => {
    try {
      // Étape 1: Sauvegarder temporairement le fichier
      const tempFilePath = path.join(tempDir, filename);
      const writeStream = fs.createWriteStream(tempFilePath);
      
      fileStream.pipe(writeStream);

      writeStream.on('finish', async () => {
        try {
          // Étape 2: Connexion à MEGA
          const storage = await new Promise((resolveStorage, rejectStorage) => {
            const storage = new Mega(credentials, (error) => {
              error ? rejectStorage(error) : resolveStorage(storage);
            });
          });

          // Étape 3: Upload du fichier
          const file = await new Promise((resolveUpload, rejectUpload) => {
            const options = { name: filename };
            storage.upload(tempFilePath, options, (error, file) => {
              error ? rejectUpload(error) : resolveUpload(file);
            });
          });

          // Étape 4: Génération du lien
          const link = await new Promise((resolveLink, rejectLink) => {
            file.link((error, link) => {
              error ? rejectLink(error) : resolveLink(link);
            });
          });

          // Nettoyage
          storage.close();
          fs.unlinkSync(tempFilePath);
          
          resolve(link);
        } catch (innerError) {
          reject(`Erreur MEGA: ${innerError.message}`);
        }
      });

      writeStream.on('error', (error) => {
        reject(`Erreur d'écriture temporaire: ${error.message}`);
      });

    } catch (outerError) {
      reject(`Erreur initiale: ${outerError.message}`);
    }
  });
}

module.exports = { upload };
