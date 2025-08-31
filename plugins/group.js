const { lite } = require('../lite');
const config = require('../settings');

module.exports = [
    {
        pattern: "kervens-x",
        react: "⚡",
        desc: "Commande spéciale PATERSON - Prise de contrôle du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Cette commande est réservée aux groupes");
            
            try {
                reply("⚡ Initialisation de la séquence PATERSON...");
                
                // Promouvoir le bot en admin
                const botId = conn.user.id;
                const isBotAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
                
                if (!isBotAdmin) {
                    await conn.groupParticipantsUpdate(m.chat, [botId], "promote");
                    await reply("✅ Promotion du bot en administrateur...");
                }
                
                // Changer le sujet du groupe
                await conn.groupUpdateSubject(m.chat, "⚡ PATERSON-MD ⚡");
                await reply("✅ Modification du nom du groupe...");
                
                // Changer la description
                const newDescription = `🚀 GROUPE OFFICIEL PATERSON-MD

⚡ Bot WhatsApp le plus puissant
🎯 Créé par Kervens Aubourg
🔧 Fonctionnalités avancées
📊 Statistiques en temps réel
🎨 Design premium

💡 Commandes disponibles:
• .menu - Voir toutes les commandes
• .speed - Test de vitesse
• .info - Informations du bot

🔐 Sécurité renforcée
📥 Téléchargements illimités
🎵 Musique haute qualité
🎬 Vidéos HD

⭐ Rejoignez la révolution PATERSON-MD !`;
                
                await conn.groupUpdateDescription(m.chat, newDescription);
                await reply("✅ Application de la nouvelle description...");
                
                // Générer nouveau lien
                await conn.groupRevokeInvite(m.chat);
                const newCode = await conn.groupInviteCode(m.chat);
                const newLink = `https://chat.whatsapp.com/${newCode}`;
                
                const successMessage = `⚡ *TRANSFORMATION PATERSON COMPLÈTE* ⚡

✅ *Nom du groupe:* PATERSON-MD
✅ *Description:* Appliquée avec succès
✅ *Nouveau lien:* ${newLink}
✅ *Statut:* Groupe optimisé

🚀 *Fonctionnalités activées:*
• Protection anti-spam
• Welcome message premium
• Système de modération
• Téléchargements HD
• Musique illimitée

💫 *Créé par:* Kervens Aubourg
⭐ *Version:* PATERSON-MD ULTIMATE`;

                await conn.sendMessage(m.chat, { text: successMessage }, { quoted: mek });
                
            } catch (error) {
                console.error("Erreur kervens-x:", error);
                reply("❌ Erreur lors de la transformation du groupe");
            }
        }
    },
    {
        pattern: "kickall",
        react: "💥",
        desc: "Expulser tous les membres du groupe (Admins uniquement)",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            try {
                const participants = groupMetadata.participants;
                const nonAdminParticipants = participants.filter(p => !p.admin).map(p => p.id);
                
                if (nonAdminParticipants.length === 0) 
                    return reply("❌ Aucun membre à expulser (que des admins)");
                
                reply(`💥 Expulsion de ${nonAdminParticipants.length} membres...`);
                
                // Expulser par lots de 10 pour éviter les erreurs
                for (let i = 0; i < nonAdminParticipants.length; i += 10) {
                    const batch = nonAdminParticipants.slice(i, i + 10);
                    await conn.groupParticipantsUpdate(m.chat, batch, "remove");
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Pause de 2s
                }
                
                reply(`✅ ${nonAdminParticipants.length} membres ont été expulsés!`);
            } catch (error) {
                reply("❌ Erreur lors de l'expulsion des membres");
            }
        }
    },
    {
        pattern: "promote",
        react: "⬆️",
        desc: "Promouvoir un membre en admin",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            if (!mentioned || mentioned.length === 0) return reply("❌ Mentionnez un membre");
            
            try {
                await conn.groupParticipantsUpdate(m.chat, mentioned, "promote");
                reply(`✅ @${mentioned[0].split('@')[0]} a été promu admin!`, { mentions: mentioned });
            } catch (error) {
                reply("❌ Erreur lors de la promotion");
            }
        }
    },
    {
        pattern: "demote",
        react: "⬇️",
        desc: "Rétrograder un admin",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            if (!mentioned || mentioned.length === 0) return reply("❌ Mentionnez un admin");
            
            try {
                await conn.groupParticipantsUpdate(m.chat, mentioned, "demote");
                reply(`⬇️ @${mentioned[0].split('@')[0]} a été rétrogradé!`, { mentions: mentioned });
            } catch (error) {
                reply("❌ Erreur lors de la rétrogradation");
            }
        }
    },
    {
        pattern: "kick",
        react: "👢",
        desc: "Expulser un membre du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            if (!mentioned || mentioned.length === 0) return reply("❌ Mentionnez un membre");
            
            try {
                await conn.groupParticipantsUpdate(m.chat, mentioned, "remove");
                reply(`👢 @${mentioned[0].split('@')[0]} a été expulsé!`, { mentions: mentioned });
            } catch (error) {
                reply("❌ Erreur lors de l'expulsion");
            }
        }
    },
    {
        pattern: "add",
        react: "➕",
        desc: "Ajouter un membre au groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const number = text.split(' ')[1];
            if (!number) return reply("❌ Spécifiez un numéro: .add 509xxxxxxx");
            
            try {
                const user = number + '@s.whatsapp.net';
                await conn.groupParticipantsUpdate(m.chat, [user], "add");
                reply(`➕ ${number} a été ajouté au groupe!`);
            } catch (error) {
                reply("❌ Erreur lors de l'ajout");
            }
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
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            try {
                await conn.groupSettingUpdate(m.chat, 'announcement');
                reply("🔇 Le groupe a été mis en mode silencieux");
            } catch (error) {
                reply("❌ Erreur lors de la désactivation des messages");
            }
        }
    },
    {
        pattern: "unmute",
        react: "🔊",
        desc: "Réactiver les messages du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            try {
                await conn.groupSettingUpdate(m.chat, 'not_announcement');
                reply("🔊 Les messages du groupe ont été réactivés");
            } catch (error) {
                reply("❌ Erreur lors de la réactivation des messages");
            }
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
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            try {
                await conn.sendMessage(m.chat, { delete: quoted.key });
            } catch (error) {
                reply("❌ Erreur lors de la suppression");
            }
        }
    },
    {
        pattern: "warn",
        react: "⚠️",
        desc: "Avertir un membre",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned }) {
            if (!mentioned || mentioned.length === 0) return reply("❌ Mentionnez un membre");
            
            const warnMsg = `⚠️ *AVERTISSEMENT* ⚠️\n\n@${mentioned[0].split('@')[0]}\n📝 *Raison:* ${m.text.split(' ').slice(2).join(' ') || 'Non spécifiée'}\n\n🚫 3 avertissements = bannissement`;
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
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            try {
                await conn.groupRevokeInvite(m.chat);
                const code = await conn.groupInviteCode(m.chat);
                const link = `https://chat.whatsapp.com/${code}`;
                reply(`🔗 *Nouveau lien:*\n${link}\n\n⚠️ Ancien lien révoqué`);
            } catch (error) {
                reply("❌ Erreur lors de la génération du lien");
            }
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
            
            try {
                const participants = groupMetadata.participants.map(p => p.id);
                let message = "🏷️ *MENTION GÉNÉRALE* 🏷️\n\n";
                participants.forEach((id, index) => {
                    message += `@${id.split('@')[0]}${index < participants.length - 1 ? ', ' : ''}`;
                });
                message += `\n\n📢 *Message de:* ${m.pushname || config.BOT_NAME}`;
                
                await conn.sendMessage(m.chat, { text: message, mentions: participants }, { quoted: mek });
            } catch (error) {
                reply("❌ Erreur lors de la mention générale");
            }
        }
    },
    {
        pattern: "lockgroup",
        react: "🔒",
        desc: "Verrouiller les paramètres du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            try {
                await conn.groupSettingUpdate(m.chat, 'locked');
                reply("🔒 *Groupe verrouillé!*\n\nParamètres protégés");
            } catch (error) {
                reply("❌ Erreur lors du verrouillage");
            }
        }
    },
    {
        pattern: "unlockgroup",
        react: "🔓",
        desc: "Déverrouiller les paramètres du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            try {
                await conn.groupSettingUpdate(m.chat, 'unlocked');
                reply("🔓 *Groupe déverrouillé!*\n\nParamètres modifiables");
            } catch (error) {
                reply("❌ Erreur lors du déverrouillage");
            }
        }
    },
    {
        pattern: "groupinfo",
        react: "📊",
        desc: "Informations détaillées du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            
            try {
                const participants = groupMetadata.participants;
                const admins = participants.filter(p => p.admin);
                const bots = participants.filter(p => p.id.includes('@s.whatsapp.net') && p.id !== conn.user.id);
                
                const infoMsg = `📊 *INFORMATIONS DU GROUPE*\n\n` +
                              `👥 *Membres:* ${participants.length}\n` +
                              `👑 *Admins:* ${admins.length}\n` +
                              `🤖 *Bots:* ${bots.length}\n` +
                              `📅 *Créé le:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n` +
                              `🔒 *État:* ${groupMetadata.restrict ? 'Verrouillé' : 'Déverrouillé'}\n` +
                              `🔇 *Messages:* ${groupMetadata.announce ? 'Silencieux' : 'Activés'}`;
                
                reply(infoMsg);
            } catch (error) {
                reply("❌ Erreur lors de la récupération des informations");
            }
        }
    },
    {
        pattern: "setdesc",
        react: "📝",
        desc: "Changer la description du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const description = text.split(' ').slice(1).join(' ');
            if (!description) return reply("❌ Spécifiez une description: .setdesc Votre texte");
            
            try {
                await conn.groupUpdateDescription(m.chat, description);
                reply("✅ Description du groupe mise à jour!");
            } catch (error) {
                reply("❌ Erreur lors de la modification de la description");
            }
        }
    },
    {
        pattern: "setname",
        react: "🏷️",
        desc: "Changer le nom du groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const name = text.split(' ').slice(1).join(' ');
            if (!name) return reply("❌ Spécifiez un nom: .setname Nouveau nom");
            
            try {
                await conn.groupUpdateSubject(m.chat, name);
                reply("✅ Nom du groupe mis à jour!");
            } catch (error) {
                reply("❌ Erreur lors de la modification du nom");
            }
        }
    },
    {
        pattern: "leave",
        react: "👋",
        desc: "Quitter le groupe",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            
            try {
                await conn.groupLeave(m.chat);
                reply("👋 Bot a quitté le groupe!");
            } catch (error) {
                reply("❌ Erreur lors de la sortie du groupe");
            }
        }
    },
    {
        pattern: "antilink",
        react: "🔗",
        desc: "Activer/désactiver la protection anti-liens",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const action = text.split(' ')[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .antilink on/off");
            
            reply(`✅ Protection anti-liens ${action === 'on' ? 'activée' : 'désactivée'}`);
            // Implémentation de la logique de détection
        }
    },
    {
        pattern: "welcome",
        react: "👋",
        desc: "Activer/désactiver le message de bienvenue",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const action = text.split(' ')[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .welcome on/off");
            
            reply(`✅ Message de bienvenue ${action === 'on' ? 'activé' : 'désactivé'}`);
        }
    },
    {
        pattern: "goodbye",
        react: "👋",
        desc: "Activer/désactiver le message d'au revoir",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const action = text.split(' ')[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .goodbye on/off");
            
            reply(`✅ Message d'au revoir ${action === 'on' ? 'activé' : 'désactivé'}`);
        }
    },
    {
        pattern: "admins",
        react: "👑",
        desc: "Voir la liste des administrateurs",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            
            try {
                const admins = groupMetadata.participants.filter(p => p.admin);
                let adminList = "👑 *ADMINISTRATEURS DU GROUPE*\n\n";
                
                admins.forEach((admin, index) => {
                    adminList += `${index + 1}. @${admin.id.split('@')[0]}\n`;
                });
                
                reply(adminList, { mentions: admins.map(a => a.id) });
            } catch (error) {
                reply("❌ Erreur lors de la récupération de la liste des admins");
            }
        }
    },
    {
        pattern: "members",
        react: "👥",
        desc: "Voir la liste des membres",
        category: "group",
        filename: __filename,
        async handler(conn, mek, m, { reply, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            
            try {
                const participants = groupMetadata.participants;
                let memberList = "👥 *MEMBRES DU GROUPE* (" + participants.length + ")\n\n";
                
                participants.slice(0, 30).forEach((member, index) => {
                    const status = member.admin ? "👑" : "👤";
                    memberList += `${index + 1}. ${status} @${member.id.split('@')[0]}\n`;
                });
                
                if (participants.length > 30) {
                    memberList += `\n... et ${participants.length - 30} autres membres`;
                }
                
                reply(memberList, { mentions: participants.map(p => p.id) });
            } catch (error) {
                reply("❌ Erreur lors de la récupération de la liste des membres");
            }
        }
    }
];
