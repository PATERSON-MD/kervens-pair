const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const sharp = require('sharp'); // Pour le traitement d'image

class StickerConverter {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        this.ensureTempDir();
        this.supportedFormats = ['webp', 'png', 'jpg', 'jpeg', 'gif'];
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async cleanFiles(...files) {
        await Promise.all(files.map(async file => {
            if (file && fs.existsSync(file)) {
                try {
                    await fs.promises.unlink(file);
                } catch (error) {
                    console.warn(`Could not delete temp file: ${file}`, error);
                }
            }
        }));
    }

    async convertSticker(stickerBuffer, options = {}) {
        const {
            outputFormat = 'png',
            resize = 512,
            quality = 90,
            removeBackground = false,
            circular = false,
            timeout = 15000
        } = options;

        if (!this.supportedFormats.includes(outputFormat.toLowerCase())) {
            throw new Error(`Unsupported output format: ${outputFormat}`);
        }

        const inputPath = path.join(this.tempDir, `input_${Date.now()}.webp`);
        const outputPath = path.join(this.tempDir, `output_${Date.now()}.${outputFormat}`);
        const tempPath = path.join(this.tempDir, `temp_${Date.now()}.png`);

        try {
            // Écrire le sticker dans un fichier temporaire
            await fs.promises.writeFile(inputPath, stickerBuffer);

            // Préparer les arguments FFmpeg
            const args = [
                '-y',           // Overwrite output files
                '-i', inputPath,
                '-vf', `scale=${resize}:-1:flags=lanczos`,
                '-compression_level', '6'
            ];

            // Options avancées
            if (removeBackground) {
                args.push('-vf', 'colorkey=white:0.01:0.1', '-preserve_transparency', '1');
            }

            if (circular) {
                args.push('-vf', 'format=rgba,geq=r=\'r(X,Y)\':a=\'0.5*gt(sqrt((X-W/2)*(X-W/2)+(Y-H/2)*(Y-H/2)),H/2)*alpha(X,Y)\'');
            }

            // Paramètres de qualité
            if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
                args.push('-qscale:v', String(quality));
            } else if (outputFormat === 'png') {
                args.push('-compression_level', '9');
            }

            args.push(outputPath);

            // Exécuter la conversion
            await this.runFFmpeg(args, timeout);

            // Post-traitement avec Sharp si nécessaire
            if (removeBackground || circular) {
                await this.postProcessImage(outputPath, tempPath, options);
                await fs.promises.rename(tempPath, outputPath);
            }

            // Lire et retourner le fichier converti
            return await fs.promises.readFile(outputPath);
        } catch (error) {
            throw new Error(`Conversion failed: ${error.message}`);
        } finally {
            // Nettoyer les fichiers temporaires
            await this.cleanFiles(inputPath, outputPath, tempPath);
        }
    }

    async runFFmpeg(args, timeout) {
        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(ffmpegPath, args, { timeout });
            
            let errorOutput = '';
            ffmpeg.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            const timeoutId = setTimeout(() => {
                ffmpeg.kill('SIGKILL');
                reject(new Error(`FFmpeg timeout after ${timeout}ms`));
            }, timeout);

            ffmpeg.on('close', (code) => {
                clearTimeout(timeoutId);
                if (code !== 0) {
                    reject(new Error(`FFmpeg error [${code}]: ${errorOutput.substring(0, 200)}`));
                } else {
                    resolve();
                }
            });

            ffmpeg.on('error', (err) => {
                clearTimeout(timeoutId);
                reject(err);
            });
        });
    }

    async postProcessImage(inputPath, outputPath, options) {
        try {
            let image = sharp(inputPath);

            // Supprimer l'arrière-plan
            if (options.removeBackground) {
                image = image.flatten({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
            }

            // Créer une forme circulaire
            if (options.circular) {
                const metadata = await image.metadata();
                const size = Math.min(metadata.width, metadata.height);
                
                image = image.resize(size, size)
                    .composite([{
                        input: Buffer.from(
                            `<svg><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="black"/></svg>`
                        ),
                        blend: 'dest-in'
                    }]);
            }

            // Appliquer les modifications et sauvegarder
            await image.toFile(outputPath);
        } catch (error) {
            throw new Error(`Post-processing failed: ${error.message}`);
        }
    }

    async createStickerFromImage(imageBuffer, options = {}) {
        const {
            resize = 512,
            quality = 90,
            timeout = 10000
        } = options;

        const inputPath = path.join(this.tempDir, `input_img_${Date.now()}.png`);
        const outputPath = path.join(this.tempDir, `sticker_${Date.now()}.webp`);

        try {
            // Écrire l'image dans un fichier temporaire
            await fs.promises.writeFile(inputPath, imageBuffer);

            // Préparer les arguments FFmpeg pour créer un sticker
            const args = [
                '-y',
                '-i', inputPath,
                '-vf', `scale=${resize}:-1:flags=lanczos`,
                '-lossless', '0',
                '-q:v', String(quality),
                '-compression_level', '6',
                '-preset', 'default',
                '-loop', '0',
                outputPath
            ];

            // Exécuter la conversion
            await this.runFFmpeg(args, timeout);

            // Lire et retourner le sticker
            return await fs.promises.readFile(outputPath);
        } catch (error) {
            throw new Error(`Sticker creation failed: ${error.message}`);
        } finally {
            // Nettoyer les fichiers temporaires
            await this.cleanFiles(inputPath, outputPath);
        }
    }

    async convertToAnimatedSticker(videoBuffer, options = {}) {
        const {
            fps = 10,
            resize = 512,
            loop = true,
            optimize = true,
            timeout = 30000
        } = options;

        const inputPath = path.join(this.tempDir, `input_vid_${Date.now()}.mp4`);
        const outputPath = path.join(this.tempDir, `animated_${Date.now()}.webp`);

        try {
            // Écrire la vidéo dans un fichier temporaire
            await fs.promises.writeFile(inputPath, videoBuffer);

            // Préparer les arguments FFmpeg
            const args = [
                '-y',
                '-i', inputPath,
                '-vf', `fps=${fps},scale=${resize}:-1:flags=lanczos`,
                '-loop', loop ? '0' : '1',
                '-lossless', optimize ? '1' : '0',
                '-q:v', optimize ? '50' : '80',
                '-compression_level', '6',
                '-preset', 'default',
                '-an', // Désactiver l'audio
                outputPath
            ];

            // Exécuter la conversion
            await this.runFFmpeg(args, timeout);

            // Lire et retourner le sticker animé
            return await fs.promises.readFile(outputPath);
        } catch (error) {
            throw new Error(`Animated sticker creation failed: ${error.message}`);
        } finally {
            // Nettoyer les fichiers temporaires
            await this.cleanFiles(inputPath, outputPath);
        }
    }
}

module.exports = new StickerConverter();
