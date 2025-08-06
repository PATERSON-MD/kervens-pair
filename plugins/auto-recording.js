const { lite } = require('../lite');
const config = require('../settings');

// A listener that automatically sets the bot's presence to 'recording'
// for every incoming message if the AUTO_RECORDING setting is enabled.
lite({
  on: "body"
},    
async (conn, mek, m, { from }) => {
    try {
        // Check if the AUTO_RECORDING setting is enabled in the config file.
        // The check uses a strict comparison to the string 'true'.
        if (config.AUTO_RECORDING === 'true') {
            await conn.sendPresenceUpdate('recording', from);
        }
    } catch (e) {
        // Log any errors that occur during the presence update.
        // This is good practice to help with debugging.
        console.error("Error setting presence to recording:", e);
    }
});
