const Mega = require('megajs').default;
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

// Configuration unique
const credentials = {
  email: process.env.MEGA_EMAIL || 'romeochefbratva200k@gmail.com',
  password: process.env.MEGA_PASSWORD || 'UMP-MP5-MP40',
  userAgent: 'PATERSON-MD Cloud Service'
};

// Créer le dossier temp une seule fois
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function upload(fileStream, filename) {
  const tempFilePath = path.join(tempDir, filename);
  
  try {
    // 1. Sauvegarde temporaire du fichier
    const writeStream = fs.createWriteStream(tempFilePath);
    await pipeline(fileStream, writeStream);

    // 2. Connexion à MEGA
    const storage = await Mega.login(credentials);
    
    // 3. Upload du fichier
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
      try { fs.unlinkSync(tempFilePath); } catch (cleanError) {}
    }
    console.error('[MEGA ERREUR]', error);
    throw new Error(`Échec de l'upload: ${error.message}`);
  }
}

module.exports = { upload };
