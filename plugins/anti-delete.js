const { lite } = require('../lite');
const { getAnti, setAnti } = require('../data/antidel');

lite({
    pattern: "antidelete",
    alias: ['antidel', 'del'],
    desc: "Toggle anti-delete feature",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { reply, text, isCreator }) => {
    if (!isCreator) {
        return reply('This command is for the bot owner only.');
    }
    
    try {
        if (!text || text.toLowerCase() === 'status') {
            const currentStatus = await getAnti();
            const statusText = currentStatus ? '✅ ON' : '❌ OFF';
            return reply(`*Anti-Delete Status:* ${statusText}\n\n*Usage:*\n• .antidelete on\n• .antidelete off`);
        }
        
        const action = text.toLowerCase().trim();
        
        if (action === 'on') {
            await setAnti(true);
            return reply('✅ Anti-delete has been enabled.');
        } 
        else if (action === 'off') {
            await setAnti(false);
            return reply('❌ Anti-delete has been disabled.');
        } 
        else {
            return reply('Invalid command. Please use:\n• *.antidelete on*\n• *.antidelete off*\n• *.antidelete status*');
        }
    } catch (e) {
        console.error("Error in antidelete command:", e);
        return reply("An error occurred while processing your request.");
    }
});
