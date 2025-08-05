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
│ .quiz         - Quiz interactif
│ .devinette    - Devine le nombre
│ 
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯

> ${config.DESCRIPTION || "Bot PATERSON-MD créé par KERVENS AUBOURG"}
© ${new Date().getFullYear()} PATERSON-MD | Tous droits réservés`;

        // Envoi du menu avec image
        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL || 'https://i.ibb.co/pXL9RYv/temp-image.jpg' },
                caption: madeMenu,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.error('Erreur du menu:', e);
        reply(`❌ Erreur lors du chargement du menu: ${e.message}`);
    }
});
