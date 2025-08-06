const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { spawn } = require('child_process');
const logger = require('../lib/logger'); // Assurez-vous d'avoir un logger configuré

class AudioConverter {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        this.formats = {
            mp3: {
                args: ['-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'],
                ext: 'mp3'
            },
            opus: {
                args: ['-vn', '-c:a', 'libopus', '-b:a', '96k', '-vbr', 'on', '-compression_level', '10'],
                ext: 'opus'
            },
            ogg: {
                args: ['-vn', '-c:a', 'libvorbis', '-b:a', '128k', '-ar', '48000'],
                ext: 'ogg'
            },
            aac: {
                args: ['-vn', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100'],
                ext: 'aac'
            }
        };
        this.ensureTempDir();
    }

    ensureTempDir() {
        try {
            if (!fs.existsSync(this.tempDir)) {
                fs.mkdirSync(this.tempDir, { recursive: true });
                logger.info(`Created temp directory: ${this.tempDir}`);
            }
        } catch (error) {
            logger.error(`Error creating temp directory: ${error.message}`);
        }
    }

    async cleanFile(file) {
        if (!file || !fs.existsSync(file)) return;
        
        try {
            await fs.promises.unlink(file);
            logger.debug(`Cleaned temp file: ${path.basename(file)}`);
        } catch (error) {
            logger.warn(`Failed to clean file ${path.basename(file)}: ${error.message}`);
        }
    }

    async convert(buffer, options = {}) {
        const {
            inputFormat = 'mp3',
            outputFormat = 'mp3',
            customArgs = [],
            timeout = 30000
        } = options;

        const inputPath = path.join(this.tempDir, `${Date.now()}_in.${inputFormat}`);
        const outputPath = path.join(this.tempDir, `${Date.now()}_out.${this.formats[outputFormat]?.ext || outputFormat}`);

        try {
            // Écrire le buffer d'entrée dans un fichier temporaire
            await fs.promises.writeFile(inputPath, buffer);
            logger.debug(`Input file written: ${path.basename(inputPath)}`);

            // Préparer les arguments FFmpeg
            const formatConfig = this.formats[outputFormat] || {};
            const args = [
                '-y',           // Overwrite output files
                '-i', inputPath,
                ...(formatConfig.args || []),
                ...customArgs,
                outputPath
            ];

            logger.debug(`FFmpeg command: ${ffmpegPath} ${args.join(' ')}`);

            return new Promise((resolve, reject) => {
                const ffmpeg = spawn(ffmpegPath, args, { timeout });

                // Gestion des timeouts
                const timeoutId = setTimeout(() => {
                    ffmpeg.kill('SIGKILL');
                    reject(new Error(`FFmpeg timeout after ${timeout}ms`));
                }, timeout);

                let errorOutput = '';
                ffmpeg.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });

                ffmpeg.on('close', async (code) => {
                    clearTimeout(timeoutId);
                    await this.cleanFile(inputPath);

                    if (code !== 0) {
                        logger.error(`FFmpeg conversion failed (code ${code}): ${errorOutput}`);
                        await this.cleanFile(outputPath);
                        return reject(new Error(`Conversion failed with code ${code}: ${errorOutput.substring(0, 200)}`));
                    }

                    try {
                        const result = await fs.promises.readFile(outputPath);
                        logger.info(`Conversion successful: ${inputFormat} → ${outputFormat}, ${buffer.length} bytes → ${result.length} bytes`);
                        await this.cleanFile(outputPath);
                        resolve(result);
                    } catch (readError) {
                        reject(readError);
                    }
                });

                ffmpeg.on('error', (err) => {
                    clearTimeout(timeoutId);
                    reject(err);
                });
            });
        } catch (err) {
            await this.cleanFile(inputPath);
            await this.cleanFile(outputPath);
            throw err;
        }
    }

    // Méthodes spécifiques pour différents formats
    async toMP3(buffer, inputFormat = 'mp3') {
        return this.convert(buffer, {
            inputFormat,
            outputFormat: 'mp3'
        });
    }

    async toPTT(buffer, inputFormat = 'mp3') {
        return this.convert(buffer, {
            inputFormat,
            outputFormat: 'opus'
        });
    }

    async toOGG(buffer, inputFormat = 'mp3') {
        return this.convert(buffer, {
            inputFormat,
            outputFormat: 'ogg'
        });
    }

    async extractAudio(buffer, inputFormat = 'mp4', outputFormat = 'mp3') {
        return this.convert(buffer, {
            inputFormat,
            outputFormat,
            customArgs: ['-map', '0:a'] // Extraire uniquement la piste audio
        });
    }

    async normalizeAudio(buffer, inputFormat = 'mp3') {
        return this.convert(buffer, {
            inputFormat,
            outputFormat: 'mp3',
            customArgs: [
                '-af', 'loudnorm=I=-16:LRA=11:TP=-1.5'
            ]
        });
    }

    async convertStream(readableStream, options = {}) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            readableStream.on('data', (chunk) => chunks.push(chunk));
            readableStream.on('end', async () => {
                try {
                    const buffer = Buffer.concat(chunks);
                    const result = await this.convert(buffer, options);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            readableStream.on('error', reject);
        });
    }
}

module.exports = new AudioConverter();
