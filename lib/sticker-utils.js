const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * @description Récupère une image depuis une URL.
 * @param {string} url - L'URL de l'image.
 * @returns {Promise<Buffer>} - Le buffer de l'image.
 * @throws {Error} Si la récupération échoue.
 */
async function fetchImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'image :", error);
        throw new Error("Impossible de récupérer l'image.");
    }
}

/**
 * @description Récupère un GIF depuis une URL d'API.
 * @param {string} url - Le point de terminaison de l'API pour le GIF.
 * @returns {Promise<Buffer>} - Le buffer du GIF.
 * @throws {Error} Si la récupération échoue.
 */
async function fetchGif(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération du GIF :", error);
        throw new Error("Impossible de récupérer le GIF.");
    }
}

/**
 * @description Convertit un buffer GIF en buffer WebP pour en faire un sticker.
 * @param {Buffer} gifBuffer - Le buffer du GIF.
 * @returns {Promise<Buffer>} - Le buffer WebP du sticker.
 */
async function gifToSticker(gifBuffer) {
    const outputFileName = Crypto.randomBytes(6).toString('hex') + ".webp";
    const inputFileName = Crypto.randomBytes(6).toString('hex') + ".gif";
    const outputPath = path.join(tmpdir(), outputFileName);
    const inputPath = path.join(tmpdir(), inputFileName);

    fs.writeFileSync(inputPath, gifBuffer);

    await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .on("error", (err) => {
                console.error("Erreur FFmpeg lors de la conversion du GIF :", err);
                reject(new Error("La conversion du GIF a échoué."));
            })
            .on("end", () => {
                // Nettoyage des fichiers temporaires après la conversion
                fs.unlinkSync(inputPath);
                resolve(true);
            })
            .addOutputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse",
                "-loop", "0",
                "-preset", "default",
                "-an",
                "-vsync", "0"
            ])
            .toFormat("webp")
            .save(outputPath);
    });

    const webpBuffer = fs.readFileSync(outputPath);

    // Nettoyage final du fichier de sortie
    fs.unlinkSync(outputPath);

    return webpBuffer;
}

module.exports = { fetchImage, fetchGif, gifToSticker };
