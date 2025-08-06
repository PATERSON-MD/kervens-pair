const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Fetch a GIF from a given API URL.
 * @param {string} url - The API endpoint to fetch the GIF.
 * @returns {Promise<Buffer>} - The GIF buffer.
 */
async function fetchGif(url) {
    try {
        const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            timeout: 15000 // 15s timeout
        });
        return response.data;
    } catch (error) {
        console.error("❌ Error fetching GIF:", error);
        throw new Error(`Could not fetch GIF: ${error.message}`);
    }
}

/**
 * Converts a GIF buffer to a video buffer.
 * @param {Buffer} gifBuffer - The GIF buffer.
 * @returns {Promise<Buffer>} - The MP4 video buffer.
 */
async function gifToVideo(gifBuffer) {
    if (!Buffer.isBuffer(gifBuffer) || gifBuffer.length === 0) {
        throw new Error("Invalid GIF buffer input");
    }

    const filename = Crypto.randomBytes(8).toString('hex');
    const gifPath = path.join(tmpdir(), `${filename}.gif`);
    const mp4Path = path.join(tmpdir(), `${filename}.mp4`);

    try {
        fs.writeFileSync(gifPath, gifBuffer);

        await new Promise((resolve, reject) => {
            ffmpeg(gifPath)
                .outputOptions([
                    "-movflags faststart",
                    "-pix_fmt yuv420p",
                    "-vf scale=trunc(iw/2)*2:trunc(ih/2)*2",
                    "-c:v libx264",
                    "-preset fast",
                    "-crf 23"
                ])
                .on("error", reject)
                .on("end", resolve)
                .save(mp4Path);
        });

        return fs.readFileSync(mp4Path);
    } catch (error) {
        console.error("❌ ffmpeg conversion error:", error);
        throw new Error(`Video conversion failed: ${error.message}`);
    } finally {
        // Cleanup temp files
        [gifPath, mp4Path].forEach(file => {
            if (fs.existsSync(file)) fs.unlinkSync(file);
        });
    }
}

/**
 * Fetch GIF from URL and convert to MP4 video (optimized for PATERSON-MD)
 * @param {string} url - Source URL for the GIF
 * @returns {Promise<Buffer>} - Converted MP4 buffer
 */
async function fetchAndConvertGif(url) {
    const gifBuffer = await fetchGif(url);
    return await gifToVideo(gifBuffer);
}

module.exports = { 
    fetchGif, 
    gifToVideo, 
    fetchAndConvertGif 
};
