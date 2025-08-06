const { lite } = require('../lite');
const os = require('os');
const { runtime } = require('../lib/functions');
const config = require('../settings');

lite({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Vérifie si le bot est actif et en ligne",
    category: "main",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, isGroup }) => {
    try {
        const heapUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
        const uptime = runtime(process.uptime());
        const currentTime = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // URL de l'image spécifique pour Alive
        const aliveImage = 'https://i.ibb.co/qMxK96PS/malvin-xd.jpg';
        // Lien du groupe de support
        const supportGroupUrl = 'https://chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh';

        // Création du message principal
        let caption = `
╭━━〔 🤖 *${config.BOT_NAME || "PATERSON-MD"} STATUS* 〕━━⬣
┃ 🟢 *Bot actif et en ligne !*
┃
┃ 👑 *Propriétaire :* ${config.OWNER_NAME || "KERVENS AUBOURG"}
┃ 🔖 *Version :* ${config.version || "1.0.0"}
┃ 🛠️ *Préfixe :* [ ${config.PREFIX || "."} ]
┃ ⚙️ *Mode :* [ ${config.MODE || "public"} ]
┃ 🕒 *Heure :* ${currentTime}
┃ 💾 *RAM :* ${heapUsed}MB / ${totalMem}MB
┃ 🖥️ *Hôte :* ${os.hostname()}
┃ ⏱️ *Uptime :* ${uptime}
╰━━━━━━━━━━━━━━⬣
📝 *${config.DESCRIPTION || "Bot PATERSON-MD - Intelligence Artificielle Avancée"}*
        `.trim();

        // Préparation des boutons
        const buttons = [
            {
                buttonId: 'support',
                buttonText: { displayText: '🌟 Groupe Support' },
                type: 1
            },
            {
                buttonId: 'source',
                buttonText: { displayText: '📦 Code Source' },
                type: 1
            }
        ];

        // Construction du message
        const message = {
            image: { url: aliveImage },
            caption: caption,
            footer: `Créé par KERVENS AUBOURG | PATERSON-MD © ${new Date().getFullYear()}`,
            buttons: buttons,
            headerType: 1,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 1000,
                isForwarded: true
            }
        };

        // Envoi différencié groupe/privé
        if (isGroup) {
            // Réponse dans le groupe avec bouton interactif
            await conn.sendMessage(from, message, { quoted: mek });
        } else {
            // Envoi en privé du message principal
            await conn.sendMessage(sender, message, { quoted: mek });
            
            // Envoi du lien direct avec design amélioré
            const supportMessage = `
╭━━〔 🌟 REJOIGNEZ NOTRE COMMUNAUTÉ 〕━━⬣
│
│ Développeurs passionnés, assistance technique,
│ et mises à jour exclusives!
│
│ 👉 *Lien d'invitation :*
│ ${https://chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh}
│
│ Rejoignez-nous pour discuter, partager et apprendre!
╰━━━━━━━━━━━━━━⬣
            `.trim();
            
            await conn.sendMessage(sender, {
                text: supportMessage,
                contextInfo: {
                    mentionedJid: [sender]
                }
            });
        }

    } catch (e) {
        console.error("Erreur Alive:", e);
        reply(`❌ *Erreur:* ${e.message}`);
    }
});
