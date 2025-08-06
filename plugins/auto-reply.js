const fs = require('fs');
const path = require('path');
const config = require('../settings');
const { lite } = require('../lite');

// Path to the JSON file containing auto-reply data
const autoReplyFilePath = path.join(__dirname, '../all/autoreply.json');

// Auto-reply command listener
lite({
  on: "body"
}, async (conn, mek, m, { from, body, isOwner, reply }) => {
    // Check if the auto-reply feature is enabled in the configuration.
    if (config.AUTO_REPLY !== 'true') {
        return;
    }

    try {
        // Read the auto-reply data file.
        // It's better to read it once when the bot starts if the data doesn't change often.
        // For this example, we'll read it on each message to ensure it's always up-to-date.
        const data = JSON.parse(fs.readFileSync(autoReplyFilePath, 'utf8'));

        // Loop through each key-value pair in the data.
        for (const keyword in data) {
            // Check if the message body (in lowercase) is an exact match for a keyword.
            if (body.toLowerCase() === keyword.toLowerCase()) {
                // If a match is found, send the corresponding reply.
                // The 'reply' function is a more direct way to respond than 'm.reply'.
                await reply(data[keyword]);
                
                // Once a reply is sent, exit the loop and function to avoid
                // unnecessary processing.
                return;
            }
        }
    } catch (e) {
        // Log any errors that occur during file reading or message processing.
        // This is important for debugging.
        console.error("Error in auto-reply command:", e);
    }
});
