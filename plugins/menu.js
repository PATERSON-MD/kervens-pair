const fs = require('fs');
const config = require('../settings');
const { lite, commands } = require('../lite');

lite({
    pattern: "menu",
    react: "🔥",
    alias: ["allmenu", "cmd"],
    desc: "Affiche le menu complet avec contrôles de groupe",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, pushname, reply
}) => {
    try {
        // Calcul de l'uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const formattedUptime = `${days}j ${hours}h ${minutes}m`;
        
        // Catégories améliorées
        const categories = {
            'group': '👥 COMMANDES GROUPE',
            'download': '📥 TÉLÉCHARGEMENTS',
            'fun': '🎮 DIVERTISSEMENT & JEUX',
            'owner': '👑 ADMINISTRATION',
            'ai': '🧠 INTELLIGENCE ARTIFICIELLE',
            'bug': '🐞 BUG GROUP',
            'tools': '🛠️ OUTILS',
            'media': '🎵 MÉDIA'
        };

        // Génération du contenu des catégories
        let menuContent = {};
        for (const category in categories) {
            menuContent[category] = '';
        }

        for (let cmd of commands) {
            if (cmd.pattern && !cmd.dontAddCommandList && categories[cmd.category]) {
                menuContent[cmd.category] += `│ ⬡ ${cmd.pattern}\n`;
            }
        }

        // Construction du menu principal
        let madeMenu = `
╭═══✦〔 🤖 *${config.BOT_NAME}* 〕✦═══╮
│ 👤 Utilisateur : ${pushname}
│ ⚡ Préfixe     : [ ${config.PREFIX} ]
│ 🛡️ Mode        : [ ${config.MODE} ]
│ 🔄 Uptime      : ${formattedUptime}
│ 🚀 Version     : ${config.version} BETA
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯

📚 *CATÉGORIES PRINCIPALES:*
`;

        // Ajout des catégories au menu
        for (const [category, title] of Object.entries(categories)) {
            if (menuContent[category]) {
                madeMenu += `
╭═══✦〔 ${title} 〕✦═══╮
${menuContent[category]}
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯`;
            }
        }

        // Section spéciale Bug Group
        madeMenu += `

╭═══✦〔 🚨 *BUG GROUP CONTROLS* 〕✦═══╮
│ 
│ .antipurge [on/off]  - Bloquer les purges
│ .purge                - Purger les messages
│ .lockgroup            - Verrouiller le groupe
│ .unlockgroup          - Déverrouiller
│ .restrict [all/none]  - Restrictions
│ 
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯

╭═══✦〔 🎲 *JEUX DISPONIBLES* 〕✦═══╮
│ 
│ .actionverite - Jeu Action ou Vérité
const fs = require('fs');
const config = require('../settings');
const { lite, commands } = require('../lite');

lite({
    pattern: "menu",
    react: "🔥",
    alias: ["allmenu", "cmd"],
    desc: "Affiche le menu interactif avec boutons",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, pushname, reply
}) => {
    try {
        // Calcul de l'uptime
        const uptime = process.uptime();
        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const formattedUptime = `${days}j ${hours}h ${minutes}m`;
        
        // Boutons interactifs
        const buttons = [
            { buttonId: 'group', buttonText: { displayText: '👥 GROUP' }, type: 1 },
            { buttonId: 'download', buttonText: { displayText: '📥 DOWNLOAD' }, type: 1 },
            { buttonId: 'fun', buttonText: { displayText: '🎮 FUN' }, type: 1 },
            { buttonId: 'owner', buttonText: { displayText: '👑 OWNER' }, type: 1 },
            { buttonId: 'ai', buttonText: { displayText: '🧠 AI' }, type: 1 },
            { buttonId: 'tools', buttonText: { displayText: '🛠️ TOOLS' }, type: 1 },
            { buttonId: 'media', buttonText: { displayText: '🎵 MEDIA' }, type: 1 },
            { buttonId: 'bug', buttonText: { displayText: '🐞 BUG GROUP' }, type: 1 },
            { buttonId: 'games', buttonText: { displayText: '🎲 JEUX' }, type: 1 },
            { buttonId: 'fullmenu', buttonText: { displayText: '📜 MENU COMPLET' }, type: 1 }
        ];

        // En-tête du menu
        const menuHeader = `
╭═══✦〔 🤖 *${config.BOT_NAME}* 〕✦═══╮
│ 👤 Utilisateur : ${pushname}
│ ⚡ Préfixe     : [ ${config.PREFIX} ]
│ 🛡️ Mode        : [ ${config.MODE} ]
│ 🔄 Uptime      : ${formattedUptime}
│ 🚀 Version     : ${config.version} BETA
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯

📚 *SÉLECTIONNEZ UNE CATÉGORIE:*
`;

        // Envoi du menu avec boutons
        await conn.sendMessage(
            from,
            {
                image: { url: 'https://i.ibb.co/Mx4v92Dr/malvin-xd.jpg' },
                caption: menuHeader,
                footer: '© PATERSON-MD | Cliquez sur les boutons',
                buttons: buttons,
                headerType: 4
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error('Erreur du menu:', e);
        reply(`❌ Erreur lors du chargement du menu: ${e.message}`);
    }
});

// Nouvelle commande pour gérer les interactions des boutons
lite({
    pattern: "menucategory",
    dontAddCommandList: true,
    fromMe: true,
    desc: "Gestionnaire de catégories du menu",
    filename: __filename
},
async (conn, mek, m, { reply, from }) => {
    try {
        const category = m.text.split(' ')[1];
        const categories = {
            'group': '👥 COMMANDES GROUPE',
            'download': '📥 TÉLÉCHARGEMENTS',
            'fun': '🎮 DIVERTISSEMENT',
            'owner': '👑 ADMINISTRATION',
            'ai': '🧠 INTELLIGENCE ARTIFICIELLE',
            'bug': '🐞 BUG GROUP',
            'tools': '🛠️ OUTILS',
            'media': '🎵 MÉDIA',
            'games': '🎲 JEUX'
        };

        if (!category || !categories[category]) {
            return reply("❌ Catégorie invalide !");
        }

        let commandList = `╭═══✦〔 ${categories[category]} 〕✦═══╮\n`;
        
        commands.forEach(cmd => {
            if (cmd.category === category && !cmd.dontAddCommandList) {
                commandList += `│ ⬡ ${cmd.pattern}\n`;
            }
        });

        commandList += `╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯\n\n` +
                      `_Tapez *${config.PREFIX}menu* pour revenir au menu principal_`;

        await reply(commandList);

    } catch (e) {
        console.error('Erreur de catégorie:', e);
        reply(`❌ Erreur: ${e.message}`);
    }
});
