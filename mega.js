const Mega = require('megajs').default;
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

// Utilisation des variables d'environnement
const credentials = {
  email: process.env.MEGA_EMAIL || 'romeochefbratva200k@gmail.com',
  password: process.env.MEGA_PASSWORD || 'UMP-MP5-MP40',
  userAgent: 'PATERSON-MD Cloud Service'
};

// Créer le dossier temp s'il n'existe pas
const tempDir = path.join(__dirname, 'temp');
const Mega = require('megajs').default;
const fs = require('fs');
const path = require('path');

// Configuration sécurisée
const credentials = {
  email: process.env.MEGA_EMAIL || 'romeochefbratva200k@gmail.com',
  password: process.env.MEGA_PASSWORD || 'UMP-MP5-MP40',
  userAgent: 'PATERSON-MD Cloud Service'
};

async function upload(fileStream, filename) {
  // Création du dossier temp
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempFilePath = path.join(tempDir, filename);
  
  try {
    // 1. Sauvegarde temporaire
    const writer = fs.createWriteStream(tempFilePath);
    await new Promise((resolve, reject) => {
      fileStream.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // 2. Connexion à MEGA
    const storage = await Mega.login(credentials);
    
    // 3. Upload
    const file = await storage.upload(tempFilePath, { name: filename });
    
    // 4. Génération du lien
    const link = await file.link();
    
    // 5. Nettoyage
    storage.close();
    fs.unlinkSync(tempFilePath);
    
    return link;
    
  } catch (error) {
    // Nettoyage en cas d'erreur
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    console.error('[MEGA ERROR]', error.message);
    throw new Error(`Échec de l'upload: ${error.message}`);
  }
}

module.exports = { upload };
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function upload(fileStream, filename) {
  const tempFilePath = path.join(tempDir, filename);
  
  try {
    // Étape 1: Sauvegarder temporairement le fichier
    const writeStream = fs.createWriteStream(tempFilePath);
    await pipeline(fileStream, writeStream);
    console.log(`[MEGA] Fichier temporaire créé: ${tempFilePath}`);

    // Étape 2: Connexion à MEGA
    const storage = await new Promise((resolve, reject) => {
      const storage = new Mega(credentials, (error) => {
        error ? reject(new Error(`Connexion MEGA échouée: ${error.message}`)) : resolve(storage);
      });
    });
    console.log('[MEGA] Connecté avec succès');

    // Étape 3: Upload du fichier
    const file = await new Promise((resolve, reject) => {
      storage.upload(tempFilePath, { name: filename }, (error, file) => {
        error ? reject(new Error(`Upload échoué: ${error.message}`)) : resolve(file);
      });
    });
    console.log(`[MEGA] Fichier uploadé: ${filename}`);

    // Étape 4: Génération du lien
    const link = await new Promise((resolve, reject) => {
      file.link((error, link) => {
        error ? reject(new Error(`Génération lien échouée: ${error.message}`)) : resolve(link);
      });
    });
    console.log(`[MEGA] Lien généré: ${link}`);

    // Nettoyage
    storage.close();
    fs.unlinkSync(tempFilePath);
    console.log('[MEGA] Nettoyage terminé');

    return link;
    
  } catch (error) {
    // Nettoyage en cas d'erreur
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    console.error(`[MEGA ERREUR] ${error.message}`);
    throw error;
  }
}

module.exports = { upload };const Mega = require('megajs').default;
const fs = require('fs');
const path = require('path');

// Utilisation des variables d'environnement pour plus de sécurité
const credentials = {
  email: process.env.MEGA_EMAIL || 'romeochefbratva200k@gmail.com',
  password: process.env.MEGA_PASSWORD || 'UMP-MP5-MP40',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// Créer le dossier temp s'il n'existe pas
