const config = require('../../settings');
const { lite, commands } = require('../../lite');
const fs = require('fs');
const path = require('path');

// Fonction pour compter les plugins
function countPlugins() {
    const pluginsDir = path.join(__dirname, '../../plugins');
    let pluginCount = 0;
    
    const categories = fs.readdirSync(pluginsDir);
    for (const category of categories) {
        const categoryPath = path.join(pluginsDir, category);
        if (fs.statSync(categoryPath).isDirectory()) {
            const files = fs.readdirSync(categoryPath);
            pluginCount += files.filter(file => file.endsWith('.js')).length;
        }
    }
    
    return pluginCount;
}

lite({
    pattern: "update",
    react: "🔄",
    alias: ["info", "version"],
    desc: "Affiche les informations de mise à jour du bot",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {
    try {
        // Charger les informations du package.json
        const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json')));
        
        // Calculer l'uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const formattedUptime = `${days}j ${hours}h ${minutes}m`;
        
        // Compter les plugins et commandes
        const pluginCount = countPlugins();
        const commandCount = commands.length;
        
        // Formater le changelog
        const formattedChangelog = pkg.changelog.split('\n').map(line => `│ ${line}`).join('\n');
        
        // Construire le message
        const updateMessage = `
╭═══✦〔 🔄 MISES À JOUR 〕✦═══╮
│
│ 🤖 *${config.BOT_NAME}*
│ 
│ 📦 Version : ${pkg.version}
│ 
│ 📜 Changements :
${formattedChangelog}
│ 
│ 📂 Plugins : ${pluginCount}
│ ⚙️ Commandes : ${commandCount}
│ 
│ ⏱️ Uptime : ${formattedUptime}
│ 💾 Mémoire : ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB
│ 🧩 Node.js : ${process.version}
│ 
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯

${config.DESCRIPTION || "Bot PATERSON-MD créé par KERVENS AUBOURG"}
© ${new Date().getFullYear()} PATERSON-MD | Tous droits réservés`;

        // Envoyer le message
        await conn.sendMessage(
            from,
            {
                text: updateMessage,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error('Erreur de la commande update:', e);
        reply(`❌ Erreur lors de la récupération des infos: ${e.message}`);
    }
});
