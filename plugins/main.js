const { lite } = require('../lite');
const config = require('../settings');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const axios = require('axios');

moment.locale('fr');

module.exports = [
    {
        pattern: "menu",
        react: "📜",
        alias: ["help", "cmd"],
        desc: "Affiche le menu interactif",
        category: "main",
        filename: __filename,
        async handler(conn, mek, m, { reply, pushname }) {
            const uptime = process.uptime();
            const days = Math.floor(uptime / (3600 * 24));
            const hours = Math.floor((uptime % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const formattedUptime = `${days}j ${hours}h ${minutes}m`;
            
            const buttons = [
                { buttonId: 'group', buttonText: { displayText: '👥 GROUP' }, type: 1 },
                { buttonId: 'download', buttonText: { displayText: '📥 DOWNLOAD' }, type: 1 },
                { buttonId: 'fun', buttonText: { displayText: '🎮 FUN' }, type: 1 },
                { buttonId: 'owner', buttonText: { displayText: '👑 OWNER' }, type: 1 },
                { buttonId: 'ai', buttonText: { displayText: '🧠 AI' }, type: 1 },
                { buttonId: 'tools', buttonText: { displayText: '🛠️ TOOLS' }, type: 1 },
                { buttonId: 'media', buttonText: { displayText: '🎵 MEDIA' }, type: 1 },
                { buttonId: 'bug', buttonText: { displayText: '🐞 BUG GROUP' }, type: 1 },
                { buttonId: 'games', buttonText: { displayText: '🎲 JEUX' }, type: 1 }
            ];

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

            await conn.sendMessage(
                m.chat,
                {
                    image: { url . },
                    caption: menuHeader,
                    footer: config.FOOTER,
                    buttons: buttons,
                    headerType: 4
                },
                { quoted: mek }
            );
        }
    },
    {
        pattern: "ping",
        react: "🏓",
        desc: "Vérifier la latence du bot",
        category: "main",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const start = Date.now();
            const pingMsg = await reply("📡 Calcul de la latence...");
            const end = Date.now();
            
            await conn.sendMessage(
                m.chat,
                { 
                    text: `🏓 PONG!\nLatence: ${end - start}ms`,
                    edit: pingMsg.key 
                }
            );
        }
    },
    {
        pattern: "runtime",
        react: "⏱️",
        desc: "Afficher le temps d'activité",
        category: "main",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const uptime = process.uptime();
            const days = Math.floor(uptime / (3600 * 24));
            const hours = Math.floor((uptime % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            const formattedUptime = `
⏱️ *Temps d'activité:*
${days > 0 ? `• Jours: ${days}\n` : ''}${hours > 0 ? `• Heures: ${hours}\n` : 'https://i.ibb.co/qMxK96PS/malvin-xd.jpg'}
• Minutes: ${minutes}
• Secondes: ${seconds}

🔄 Dernier redémarrage: ${moment(config.START_TIME).format('LLLL')}
`;
            
            reply(formattedUptime);
        }
    },
    {
        pattern: "owner",
        react: "👑",
        alias: ["créateur", "admin"],
        desc: "Contacter le propriétaire du bot",
        category: "main",
        filename: __filename,
        async handler(conn, mek, m, { reply, pushname }) {
            const ownerInfo = `
👑 *PROPRIÉTAIRE DU BOT*

• Nom: ${KERVENS AUBOURG}
• Contact: wa.me/${50942737567.replace('@s.whatsapp.net', '')}
• Équipe: ${BLACK || "PATERSON-MD"}

📌 *Pour les demandes sérieuses uniquement*
⚠️ Les abusers seront bloqués automatiquement
`;
            
            await conn.sendMessage(
                m.chat,
                {
                    contacts: {
                        displayName: KERVENS AUBOURG,
                        contacts: [{ vcard: createVCard(KERVENS AUBOURG, 50942737567) }]
                    },
                    caption: ownerInfo
                },
                { quoted: mek }
            );
        }
    },
    {
        pattern: "info",
        react: "ℹ️",
        desc: "Informations sur le bot",
        category: "main",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const packageInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));
            const depCount = Object.keys(packageInfo.dependencies || {}).length;
            
            const botInfo = `
🤖 *INFORMATIONS SUR ${PATERSON-MD.toUpperCase()}*

• Version: ${config.version} (${packageInfo.version})
• Développeur: ${KERVENS AUBOURG}
• Langage: Node.js ${process.version}
• Bibliothèque: Baileys v${packageInfo.dependencies['@adiwajshing/baileys']?.replace('^', '') || 'inconnue'}
• Modules: ${depCount} dépendances

📊 *Statistiques:*
• Groupes actifs: ${Object.keys(await conn.groupFetchAllParticipating()).length}
• Commandes chargées: ${commands.length}
• Uptime: ${moment.duration(process.uptime(), 'seconds').humanize()}

🔧 *Configuration:*
• Mode: ${config.MODE}
• Prefixe: ${config.PREFIX}
• Maintenance: ${config.MAINTENANCE_MODE ? '🔴 Activée' : '🟢 Désactivée'}

${config.DESCRIPTION || "Bot PATERSON-MD créé par KERVENS AUBOURG"}
`;
            
            reply(botInfo);
        }
    },
    {
        pattern: "support",
        react: "👥",
        desc: "Rejoindre le groupe de support",
        category: "main",
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
${config.SUPPORT_GROUP ? `https://chat.whatsapp.com/${await conn.groupInviteCode(config.SUPPORT_GROUP)}` : 'Non configuré'}
`;

            await reply(supportInfo);
        }
    },
    {
        pattern: "update",
        react: "🔄",
        desc: "Vérifier les mises à jour",
        category: "main",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply }) {
            try {
                const { data } = await axios.get('https://api.github.com/repos/PatersonMD/Paterson-MD/releases/latest');
                
                if (data.tag_name === config.version) {
                    return reply("✅ Vous utilisez déjà la dernière version");
                }
                
                const updateInfo = `
🔄 *MISE À JOUR DISPONIBLE!*

Version actuelle: ${config.version}
Nouvelle version: ${data.tag_name}

📝 *Notes de version:*
${data.body || "Aucune description fournie"}

📥 Téléchargement:
${data.html_url}
`;
                
                reply(updateInfo);
            } catch (e) {
                console.error("Erreur update:", e);
                reply("❌ Impossible de vérifier les mises à jour");
            }
        }
    },
    {
        pattern: "broadcast",
        react: "📢",
        desc: "Envoyer un message à tous les groupes",
        category: "main",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez entrer le message après la commande");
            
            const groups = await conn.groupFetchAllParticipating();
            const groupIds = Object.keys(groups);
            let successCount = 0;
            let failCount = 0;
            
            const progressMsg = await reply(`📢 Diffusion en cours...\n0/${groupIds.length} groupes`);
            
            for (const [index, groupId] of groupIds.entries()) {
                try {
                    await conn.sendMessage(
                        groupId, 
                        { text: `📢 *Diffusion de ${KERVENS AUBOURG}*\n\n${text}` }
                    );
                    successCount++;
                    
                    if (index % 5 === 0) {
                        await conn.sendMessage(
                            m.chat,
                            { 
                                text: `📢 Diffusion en cours...\n${index + 1}/${groupIds.length} groupes`,
                                edit: progressMsg.key 
                            }
                        );
                    }
                } catch (e) {
                    console.error(`Échec d'envoi à ${groupId}:`, e);
                    failCount++;
                }
            }
            
            await reply(`✅ Diffusion terminée!\n\n• Groupes atteints: ${successCount}\n• Échecs: ${failCount}`);
        }
    },
    {
        pattern: "status",
        react: "📊",
        desc: "Statistiques du bot",
        category: "main",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const memoryUsage = process.memoryUsage();
            const formatMemory = (bytes) => {
                if (bytes < 1024) return bytes + ' B';
                else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
                else return (bytes / 1048576).toFixed(2) + ' MB';
            };
            
            const cpuUsage = process.cpuUsage();
            const cpuPercent = ((cpuUsage.user + cpuUsage.system) / (process.uptime() * 1000) * 100).toFixed(2);
            
            const statusReport = `
📊 *STATISTIQUES DU BOT*

🖥️ *Système:*
• Plateforme: ${process.platform} ${process.arch}
• Uptime: ${moment.duration(process.uptime(), 'seconds').humanize()}
• CPU: ${cpuPercent}%
• Mémoire: ${formatMemory(memoryUsage.rss)} (RSS)

📈 *Utilisation:*
• Groupes: ${Object.keys(await conn.groupFetchAllParticipating()).length}
• Contacts: ${Object.keys(await conn.fetchBlocklist()).length}
• Commandes exécutées: ${config.COMMAND_COUNT || 0}

🛠️ *Configuration:*
• Version: ${config.version}
• Mode: ${config.MODE}
• Prefixe: ${config.PREFIX}
`;
            
            reply(statusReport);
        }
    },
    {
        pattern: "donate",
        react: "❤️",
        desc: "Soutenir le développement du bot",
        category: "main",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const donationInfo = `
❤️ *SOUTENIR LE DÉVELOPPEMENT ET AIDER HAÏTI*

Merci de vouloir soutenir ${PATERSON-MD} et la communauté Haïtienne!

Vos dons nous aident à:
- Maintenir les serveurs du bot
- Développer de nouvelles fonctionnalités
- Fournir un support rapide
- Soutenir des initiatives locales en Haïti

💳 *Dons pour Haïti:*
• NATCASH: 50935399104
• MON CASH: 50946343554

🌍 *Dons Internationaux:*
• PayPal: ${menespierre1@gmail.com|| 'paypal.me/PatersonMD'}

Votre soutien est grandement apprécié! 🙏
🇭🇹 Ensemble pour un Haïti meilleur
`;
            
            reply(donationInfo);
        }
    },
    {
        pattern: "report",
        react: "⚠️",
        desc: "Signaler un problème",
        category: "main",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, pushname }) {
            if (!text) return reply("❌ Veuillez décrire le problème après la commande");
            
            const reportData = {
                reporter: pushname,
                userId: m.sender,
                description: text,
                timestamp: new Date().toISOString()
            };
            
            try {
                const reportsPath = path.join(__dirname, '../database/reports.json');
                let reports = [];
                
                if (fs.existsSync(reportsPath)) {
                    reports = JSON.parse(fs.readFileSync(reportsPath));
                }
                
                reports.push(reportData);
                fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2));
                
                const ownerMessage = `⚠️ NOUVEAU RAPPORT ⚠️\n\n` +
                                    `👤 Par: ${pushname}\n` +
                                    `📝 Description: ${text}`;
                
                await conn.sendMessage(50942737567, { text: ownerMessage });
                
                reply("✅ Rapport envoyé! Le propriétaire a été notifié.");
            } catch (e) {
                console.error("Erreur report:", e);
                reply("❌ Échec de l'envoi du rapport. Veuillez réessayer.");
            }
        }
    }
];

function createVCard(name, number) {
    return `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${number.replace('@s.whatsapp.net', '')}:${number.replace('@s.whatsapp.net', '')}
END:VCARD`;
}

if (!config.COMMAND_COUNT) config.COMMAND_COUNT = 0;
if (!config.START_TIME) config.START_TIME = new Date();
