const fs = require('fs');
const axios = require('axios');
const path = './config.env';
const FormData = require("form-data");
require('dotenv').config({ path });

/**
 * @description Upload a local file to a CDN and get a public URL.
 * @param {string} localFilePath - The path to the local file.
 * @returns {Promise<object>} The API response data, which should include the URL.
 * @throws {Error} Throws an error if the file is not found or the API request fails.
 */
async function empiretourl(localFilePath) {
    if (!fs.existsSync(localFilePath)) {
        throw new Error(`File not found: ${localFilePath}`);
    }

    const form = new FormData();
    const fileStream = fs.createReadStream(localFilePath);
    form.append("file", fileStream);
    const originalFileName = localFilePath.split("/").pop();
    form.append("originalFileName", originalFileName);

    try {
        const response = await axios.post("https://cdn.empiretech.biz.id/api/upload.php", form, {
            headers: {
                ...form.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            throw new Error("No response received from the server.");
        } else {
            throw new Error(`Request Error: ${error.message}`);
        }
    }
}

/**
 * @description Fetches a buffer from a given URL.
 * @param {string} url - The URL of the resource.
 * @param {object} [options={}] - Axios request options.
 * @returns {Promise<Buffer|null>} A buffer of the data, or null on error.
 */
const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'get',
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (e) {
        console.error("Error fetching buffer:", e);
        return null;
    }
};

/**
 * @description Gets the IDs of all group administrators.
 * @param {Array<object>} participants - The list of group participants.
 * @returns {Array<string>} An array of JIDs of the group admins.
 */
const getGroupAdmins = (participants) => {
    return participants
        .filter(p => p.admin !== null)
        .map(p => p.id);
};

/**
 * @description Generates a random filename with a given extension.
 * @param {string} ext - The file extension (e.g., ".jpg").
 * @returns {string} The random filename.
 */
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

/**
 * @description Formats a large number with suffixes (K, M, B, etc.).
 * @param {number} eco - The number to format.
 * @returns {string} The formatted number.
 */
const h2k = (eco) => {
    const lyrik = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
    const ma = Math.floor(Math.log10(Math.abs(eco)) / 3);
    if (ma === 0) return eco.toString();
    const scale = Math.pow(10, ma * 3);
    const scaled = eco / scale;
    const formatted = scaled.toFixed(1).replace(/\.0$/, '');
    return formatted + lyrik[ma];
};

/**
 * @description Checks if a string is a valid URL.
 * @param {string} url - The string to check.
 * @returns {boolean} True if it's a URL, otherwise false.
 */
const isUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
};

/**
 * @description Formats a JavaScript object or array as a pretty-printed JSON string.
 * @param {object|array} data - The data to format.
 * @returns {string} The formatted JSON string.
 */
const Json = (data) => {
    return JSON.stringify(data, null, 2);
};

/**
 * @description Calculates and formats a runtime duration in a human-readable format.
 * @param {number} seconds - The duration in seconds.
 * @returns {string} The formatted duration (e.g., "1d 2h 3m 4s").
 */
const runtime = (seconds) => {
    seconds = Math.floor(seconds);
    const d = Math.floor(seconds / (24 * 60 * 60));
    const h = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const m = Math.floor((seconds % (60 * 60)) / 60);
    const s = Math.floor(seconds % 60);
    
    let result = '';
    if (d > 0) result += `${d}d `;
    if (h > 0) result += `${h}h `;
    if (m > 0) result += `${m}m `;
    if (s > 0) result += `${s}s`;
    
    return result.trim();
};

/**
 * @description Pauses execution for a specified number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>} A promise that resolves after the specified time.
 */
const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * @description Fetches JSON data from a URL.
 * @param {string} url - The URL to fetch from.
 * @param {object} [options={}] - Axios request options.
 * @returns {Promise<object|null>} The JSON data, or null on error.
 */
const fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        console.error("Error fetching JSON:", err);
        return null;
    }
};

/**
 * @description Saves a key-value pair to the './config.env' file.
 * @param {string} key - The key to set.
 * @param {any} value - The value to save.
 */
const saveConfig = (key, value) => {
    let configData = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
    const lines = configData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let found = false;
    const newLines = lines.map(line => {
        if (line.startsWith(`${key}=`)) {
            found = true;
            return `${key}=${value}`;
        }
        return line;
    });

    if (!found) {
        newLines.push(`${key}=${value}`);
    }

    fs.writeFileSync(path, newLines.join('\n') + '\n', 'utf8');

    // Reload environment variables to apply changes
    require('dotenv').config({ path, override: true });
};


module.exports = {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    saveConfig,
    empiretourl,
};
