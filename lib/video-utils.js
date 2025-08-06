const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

// Définir le chemin de l'exécutable ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * @description Convertit un buffer vidéo ou GIF en un buffer de sticker WebP.
 * @param {Buffer} videoBuffer - Le buffer de la vidéo ou du GIF à convertir.
 * @returns {Promise<Buffer>} - Le buffer du sticker WebP converti.
 */
async function videoToWebp(videoBuffer) {
  // Générer des noms de fichiers uniques et temporaires
  const randomFileName = Crypto.randomBytes(10).toString('hex');
  const inputPath = path.join(tmpdir(), `${randomFileName}.mp4`);
  const outputPath = path.join(tmpdir(), `${randomFileName}.webp`);

  // Sauvegarder le buffer vidéo dans un fichier temporaire
  fs.writeFileSync(inputPath, videoBuffer);

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .on('error', (err) => {
          // Supprimer le fichier temporaire d'entrée en cas d'erreur
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          reject(err);
        })
        .on('end', () => {
          // Supprimer le fichier temporaire d'entrée après la conversion
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          resolve(true);
        })
        .addOutputOptions([
          '-vcodec', 'libwebp',
          // Mettre à l'échelle la vidéo pour qu'elle s'adapte à un carré de 320x320
          "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse",
          '-loop', '0', // Boucler à l'infini
          '-ss', '00:00:00.0', // Démarrer au début de la vidéo
          '-t', '00:00:05.0', // Limiter la durée à 5 secondes
          '-preset', 'default',
          '-an', // Supprimer l'audio
          '-vsync', '0' // Synchronisation vidéo
        ])
        .toFormat('webp')
        .save(outputPath);
    });

    // Lire le buffer du fichier WebP converti
    const webpBuffer = fs.readFileSync(outputPath);
    
    // Supprimer le fichier WebP temporaire après l'avoir lu
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    return webpBuffer;
  } catch (error) {
    console.error('Erreur lors de la conversion de la vidéo en WebP :', error);
    // Supprimer le fichier de sortie si une erreur se produit
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    throw new Error('La conversion de la vidéo a échoué.');
  }
}

module.exports = {
  videoToWebp
};
