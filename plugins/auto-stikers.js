const fs = require('fs');
const path = require('path');
const config = require('../settings');
const { lite } = require('../lite');

// Path to the JSON file containing auto-sticker keywords and filenames
const autoStickerDataPath = path.join(__dirname, '../all/autosticker.json');
// Directory where the sticker files are stored
const stickerDirectory = path.join(__dirname, '../all/autosticker');

lite({
  on: "body"
}, async (conn, mek, m, { from, body }) => {
    // Check if the auto-sticker feature is enabled in the config.
    if (config.AUTO_STICKER !== 'true') {
        return;
    }

    try {
        // Read the auto-sticker data file.
        const data = JSON.parse(fs.readFileSync(autoStickerDataPath, 'utf8'));

        // Loop through each keyword in the data object.
        for (const keyword in data) {
            // Check for an exact match between the message body and a keyword.
            if (body.toLowerCase() === keyword.toLowerCase()) {
                const stickerFileName = data[keyword];
                const stickerPath = path.join(stickerDirectory, stickerFileName);

                // Check if the sticker file actually exists.
                if (fs.existsSync(stickerPath)) {
                    const stickerBuffer = fs.readFileSync(stickerPath);

                    // Send the sticker with packname and author information.
                    await conn.sendMessage(from, {
                        sticker: stickerBuffer,
                        packname: 'MALVIN-XD',
                        author: 'ʟᴏʀᴅ ᴍᴋ'
                    }, { quoted: mek });
                } else {
                    // Log a warning if a sticker is configured but the file is missing.
                    console.warn(`[AUTO-STICKER] Sticker file not found for keyword "${keyword}": ${stickerPath}`);
                }
                
                // Exit the function after sending a sticker to prevent further processing.
                return;
            }
        }
    } catch (e) {
        // Log any errors that occur, such as a missing or corrupted JSON file.
        console.error("[AUTO-STICKER] Error processing message:", e);
   }
});
