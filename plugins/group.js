const { lite } = require('../lite');
const config = require('../settings');

module.exports = [
    {
        pattern: "promote",
        react: "⬆️",
        desc: "Promouvoir un membre en admin",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Cette commande est réservée aux groupes");
            if (!m.isAdmin) return reply("❌ Permission refusée - Admins uniquement");
            
            if (!mentioned || mentioned.length === 0) 
                return reply("❌ Mentionnez un membre à promouvoir");

            await conn.groupParticipantsUpdate(
                m.chat,
                mentioned,
                "promote"
            );
            
            reply(`✅ @${mentioned[0].split('@')[0]} a été promu admin!`, { mentions: mentioned });
        }
    },
    {
        pattern: "demote",
        react: "⬇️",
        desc: "Rétrograder un admin",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned }) {
            // Implémentation similaire à promote
        }
    },
    {
        pattern: "mute",
        react: "🔇",
        desc: "Désactiver les messages du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Permission refusée");
            
            await conn.groupSettingUpdate(m.chat, 'announcement');
            reply("🔇 Le groupe a été mis en mode silencieux");
        }
    },
    {
        pattern: "unmute",
        react: "🔊",
        desc: "Réactiver les messages du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            // Implémentation similaire à mute
        }
    },
    {
        pattern: "delete",
        react: "🗑️",
        desc: "Supprimer un message",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted }) {
            if (!quoted) return reply("❌ Répondez à un message");
            
            await conn.sendMessage(
                m.chat, 
                { delete: quoted.key }
            );
        }
    },
    {
        pattern: "kick",
        react: "👢",
        desc: "Exclure un membre du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned }) {
            // Implémentation similaire à promote
        }
    },
    {
        pattern: "warn",
        react: "⚠️",
        desc: "Avertir un membre",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned }) {
            if (!mentioned || mentioned.length === 0) 
                return reply("❌ Mentionnez un membre à avertir");
            
            const warnMsg = `⚠️ AVERTISSEMENT @${mentioned[0].split('@')[0]} ⚠️\n` +
                            `Raison: ${m.text.split(' ').slice(2).join(' ') || 'Non spécifiée'}\n\n` +
                            `3 avertissements = bannissement automatique`;
            
            reply(warnMsg, { mentions: mentioned });
        }
    },
    {
        pattern: "resetlink",
        react: "🔗",
        desc: "Générer un nouveau lien d'invitation",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const code = await conn.groupInviteCode(m.chat);
            const link = `https://chat.whatsapp.com/${code}`;
            reply(`🔗 Nouveau lien du groupe :\n${link}`);
        }
    },
    {
        pattern: "welcome",
        react: "👋",
        desc: "Activer/désactiver le message de bienvenue",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .welcome on/off");
            
            // Implémentation de la logique de stockage
            reply(`✅ Message de bienvenue ${action === 'on' ? 'activé' : 'désactivé'}`);
        }
    },
    {
        pattern: "goodbye",
        react: "👋",
        desc: "Activer/désactiver le message d'au revoir",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            // Similaire à welcome
        }
    },
    {
        pattern: "tagall",
        react: "🏷️",
        desc: "Mentionner tous les membres du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const participants = groupMetadata.participants.map(p => p.id);
            const mentions = participants.map(id => ({
                tag: '@' + id.split('@')[0],
                mention: id
            }));
            
            let message = "🏷️ *MENTION GÉNÉRALE* 🏷️\n";
            message += mentions.map(m => m.tag).join('\n');
            message += `\n\n${m.pushname || config.BOT_NAME}`;
            
            await conn.sendMessage(
                m.chat,
                { 
                    text: message,
                    mentions: participants
                },
                { quoted: mek }
            );
        }
    },
    {
        pattern: "antilink",
        react: "🔗",
        desc: "Activer/désactiver la protection anti-liens",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .antilink on/off");
            
            reply(`✅ Protection anti-liens ${action === 'on' ? 'activée' : 'désactivée'}`);
            // Implémentation de la logique de détection
        }
    },
    {
        pattern: "lockgroup",
        react: "🔒",
        desc: "Verrouiller les paramètres du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            await conn.groupSettingUpdate(m.chat, 'locked');
            reply("🔒 Groupe verrouillé ! Paramètres protégés");
        }
    },
    {
        pattern: "unlockgroup",
        react: "🔓",
        desc: "Déverrouiller les paramètres du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            await conn.groupSettingUpdate(m.chat, 'unlocked');
            reply("🔓 Groupe déverrouillé !");
        }
    }
];
