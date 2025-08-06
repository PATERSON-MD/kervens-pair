const axios = require("axios");

/**
 * Fetches a mixed emoji image from the Emoji Mix API.
 * @param {string} emoji1 - First emoji (single character)
 * @param {string} emoji2 - Second emoji (single character)
 * @returns {Promise<string>} URL of the generated emoji mix image
 * @throws Will throw an error for invalid input or API failure
 */
async function fetchEmix(emoji1, emoji2) {
    // Validate input
    if (typeof emoji1 !== "string" || typeof emoji2 !== "string") {
        throw new TypeError("Both emojis must be strings");
    }
    
    if ([...emoji1].length !== 1 || [...emoji2].length !== 1) {
        throw new Error("Each emoji parameter should be a single character");
    }

    try {
        const apiUrl = `https://levanter.onrender.com/emix?q=${encodeURIComponent(emoji1)},${encodeURIComponent(emoji2)}`;
        const response = await axios.get(apiUrl, {
            timeout: 10000,  // 10-second timeout
            validateStatus: status => status === 200
        });

        if (!response.data?.result) {
            throw new Error("Invalid API response structure");
        }

        return response.data.result;
    } catch (error) {
        // Enhance error messages
        if (error.response) {
            throw new Error(`API responded with status ${error.response.status}`);
        } else if (error.request) {
            throw new Error("No response received from server");
        }
        throw new Error(`Request failed: ${error.message}`);
    }
}

module.exports = { fetchEmix };
