const { lite } = require('../lite');
const config = require('../settings');
const commands = require('./commands'); // Importe toutes les commandes
const moment = require('moment');
const fs = require('fs');

moment.locale('fr');

// Catégories avec emojis et descriptions
const CATEGORIES = {
    'main': { emoji: '🏠', title: 'Commandes Principales' },
    'group': { emoji: '👥', title: 'Gestion de Groupe' },
    'download': { emoji: '📥', title: 'Téléchargements' },
    'fun': { emoji: '🎮', title: 'Divertissement' },
    'owner': { emoji: '👑', title: 'Administration' },
    'ai': { emoji: '🧠', title: 'Intelligence Artificielle' },
    'bug': { emoji: '🐞', title: 'Contrôles & Bugs' },
    'tools': { emoji: '🛠️', title: 'Outils Utilitaires' },
    'media': { emoji: '🎵', title: 'Médias & Stickers' },
    'game': { emoji: '🎲', title: 'Jeux' }
};

lite({
    pattern: "menu",
    react: "📜",
    alias: ["help", "cmd", "command"],
    desc: "Affiche le menu interactif",
    category: "main",
    filename: __filename,
    async handler(conn, mek, m, { reply, pushname, from }) {
        try {
            // Calcul de l'uptime
            const uptime = process.uptime();
            const days = Math.floor(uptime / (3600 * 24));
            const hours = Math.floor((uptime % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const formattedUptime = `${days}j ${hours}h ${minutes}m`;
            
            // Boutons interactifs
            const buttons = Object.entries(CATEGORIES).map(([category, { emoji, title }]) => {
                return {
                    buttonId: `menucategory ${category}`,
                    buttonText: { displayText: `${emoji} ${title}` },
                    type: 1
                };
            });
            
            buttons.push(
                { buttonId: 'donate', buttonText: { displayText: '❤️ Faire un Don' }, type: 1 },
                { buttonId: 'support', buttonText: { displayText: '👥 Support' }, type: 1 }
            );
            
            // En-tête du menu
            const menuHeader = `
╭═══✦〔 🤖 *${PATERSON-MD}* 〕✦═══╮
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
                    image: { url:https://i.ibb.co/qMxK96PS/malvin-xd.jpg},
                    caption: menuHeader,
                    footer: config.FOOTER,
                    buttons: buttons,
                    headerType: 4
                },
                { quoted: mek }
            );

        } catch (e) {
            console.error('Erreur du menu:', e);
            reply(`❌ Erreur lors du chargement du menu: ${e.message}`);
        }
    }
});

// Commande pour afficher les commandes par catégorie
lite({
    pattern: "menucategory",
    react: "📚",
    dontAddCommandList: true,
    desc: "Affiche les commandes d'une catégorie",
    filename: __filename,
    async handler(conn, mek, m, { reply, text, from }) {
        try {
            const category = text.split(' ')[1];
            
            if (!category || !CATEGORIES[category]) {
                return reply("❌ Catégorie invalide! Utilisez .menu pour voir les catégories");
            }
            
            const { emoji, title } = CATEGORIES[category];
            const categoryCommands = commands.filter(cmd => 
                cmd.category === category && !cmd.dontAddCommandList
            );
            
            if (categoryCommands.length === 0) {
                return reply(`❌ Aucune commande dans la catégorie ${title}`);
            }
            
            let commandList = `╭═══✦〔 ${emoji} *${title}* 〕✦═══╮\n`;
            categoryCommands.forEach((cmd, index) => {
                commandList += `│ ⬡ ${config.PREFIX}${cmd.pattern}${cmd.alias ? ` (${cmd.alias.join(', ')})` : ''}\n`;
                if ((index + 1) % 5 === 0 && index !== categoryCommands.length - 1) {
                    commandList += '╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯\n╭═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╮\n';
                }
            });
            
            commandList += `╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯\n\n` +
                          `_Tapez *${config.PREFIX}menu* pour revenir au menu principal_`;
            
            await reply(commandList);
            
        } catch (e) {
            console.error('Erreur de catégorie:', e);
            reply(`❌ Erreur: ${e.message}`);
        }
    }
});

// Commande pour afficher toutes les commandes
lite({
    pattern: "allmenu",
    react: "📜",
    alias: ["fullmenu", "allcmd"],
    desc: "Affiche toutes les commandes disponibles",
    category: "main",
    filename: __filename,
    async handler(conn, mek, m, { reply, pushname }) {
        try {
            // Calcul de l'uptime
            const uptime = process.uptime();
            const days = Math.floor(uptime / (3600 * 24));
            const hours = Math.floor((uptime % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const formattedUptime = `${days}j ${hours}h ${minutes}m`;
            
            // Générer le contenu du menu par catégorie
            let menuContent = "";
            
            for (const [category, { emoji, title }] of Object.entries(CATEGORIES)) {
                const categoryCommands = commands.filter(cmd => 
                    cmd.category === category && !cmd.dontAddCommandList
                );
                
                if (categoryCommands.length > 0) {
                    menuContent += `\n╭═══✦〔 ${emoji} *${title}* 〕✦═══╮\n`;
                    
                    categoryCommands.forEach(cmd => {
                        menuContent += `│ ⬡ ${config.PREFIX}${cmd.pattern}`;
                        if (cmd.alias) menuContent += ` (${cmd.alias.join(', ')})`;
                        menuContent += `\n`;
                    });
                    
                    menuContent += `╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯`;
                }
            }
            
            // Menu complet
            const fullMenu = `
╭═══✦〔 🤖 *${config.BOT_NAME}* 〕✦═══╮
│ 👤 Utilisateur : ${pushname}
│ ⚡ Préfixe     : [ ${config.PREFIX} ]
│ 🛡️ Mode        : [ ${config.MODE} ]
│ 🔄 Uptime      : ${formattedUptime}
│ 🚀 Version     : ${config.version} BETA
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯

📚 *TOUTES LES COMMANDES DISPONIBLES:*
${menuContent}

🔍 *COMMANDES SPÉCIALES:*
╭═══✦〔 🐞 BUG GROUP CONTROLS 〕✦═══╮
│ .antipurge [on/off] - Bloquer les purges
│ .purge - Purger les messages
│ .lockgroup - Verrouiller le groupe
│ .unlockgroup - Déverrouiller
│ .restrict [all/none] - Restrictions
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯

╭═══✦〔 🎲 JEUX DISPONIBLES 〕✦═══╮
│ .tictactoe - Jeu du Morpion
│ .hangman - Jeu du Pendu
│ .quiz - Quiz interactif
│ .actionverite - Action ou Vérité
╰═══✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦✧✦═══╯

> ${config.DESCRIPTION || "Bot PATERSON-MD créé par KERVENS AUBOURG"}
© ${new Date().getFullYear()} PATERSON-MD | Tous droits réservés
${config.FOOTER || ""}`;

            // Envoi du menu complet
            await conn.sendMessage(
                from,
                {
                    image: { url: config.MENU_IMAGE_URL },
                    caption: fullMenu,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true
                    }
                },
                { quoted: mek }
            );

        } catch (e) {
            console.error('Erreur du menu complet:', e);
            reply(`❌ Erreur lors du chargement du menu complet: ${e.message}`);
        }
    }
});

// Commande pour afficher les informations de support
lite({
    pattern: "support",
    react: "👥",
    dontAddCommandList: true,
    desc: "Affiche les informations de support",
    filename: __filename,
    async handler(conn, mek, m, { reply }) {
        const supportInfo = `
👥 *SUPPORT & COMMUNAUTÉ*

Rejoignez notre canal officiel pour :
- Annonces importantes
- Mises à jour du bot
- Support technique
- Communauté active

🌐 *Canal Officiel:*
https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20

💬 *Groupe de Support:*
${config.SUPPORT_GROUP ? `https://chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh?mode=ac_t/${PATERSON-MD}` : 'Disponible sur demande'}

📧 *Email:*
${menespierre1@gmail.com || 'support@paterson-md.com'}`;
        
        await reply(supportInfo);
    }
});

// Commande pour afficher les informations de don
lite({
    pattern: "donate",
    react: "❤️",
    dontAddCommandList: true,
    desc: "Affiche les informations pour faire un don",
    filename: __filename,
    async handler(conn, mek, m, { reply }) {
        const donationInfo = `
❤️ *SOUTENIR LE DÉVELOPPEMENT DU BOT*

Merci de vouloir soutenir ${PATERSON-MD}et la communauté Haïtienne!

Vos dons nous aident à:
- Maintenir les serveurs du bot
- Développer de nouvelles fonctionnalités
- Fournir un support rapide
- Soutenir des initiatives locales en Haïti

💳 *Dons pour Haïti:*
• NATCASH: 50935399104
• MON CASH: 50946343554

🌍 *Dons Internationaux:*
• PayPal: ${menespierre1@gmail.com || 'paypal.me/PatersonMD'}

Votre soutien est grandement apprécié! 🙏
🇭🇹 Ensemble pour une Haïti meilleur`;
        
        await reply(donationInfo);
    }
});
