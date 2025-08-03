const Mega = require('megajs').default;

// Configuration des identifiants MEGA (à remplacer par vos propres identifiants)
const credentials = {
  email: 'romeochefbratva200k@gmail.com',
  password: 'UMP-MP5-MP40',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

/**
 * Télécharge un fichier vers MEGA.nz
 * @param {ReadableStream} fileStream - Flux de données du fichier à uploader
 * @param {string} filename - Nom du fichier pour le stockage
 * @returns {Promise<string>} Lien de téléchargement MEGA
 */
async function upload(fileStream, filename) {
  return new Promise((resolve, reject) => {
    // Initialisation du client MEGA
    const storage = new Mega(credentials, (error) => {
      if (error) return reject(`Erreur de connexion MEGA: ${error.message}`);
      
      // Configuration de l'upload
      const uploadOptions = {
        name: filename,
        allowUploadBuffering: true
      };

      // Création du flux d'upload
      const uploadStream = storage.upload(uploadOptions);
      
      // Gestion des erreurs lors de l'upload
      uploadStream.on('error', (err) => {
        reject(`Erreur d'upload: ${err.message}`);
      });

      // Génération du lien après upload
      uploadStream.on('complete', (file) => {
        file.link((err, link) => {
          if (err) return reject(`Erreur de génération de lien: ${err.message}`);
          storage.close();
          resolve(link);
        });
      });

      // Démarrage de l'upload
      fileStream.pipe(uploadStream);
    });
  });
}

module.exports = { upload };
