const { lite } = require('../lite');
const config = require('../settings');
const fs = require('fs');
const path = require('path');

// Chemin du fichier de rapport de bugs
const BUG_REPORT_PATH = path.join(__dirname, '../database/bugs.json');

// Initialiser le fichier de bugs s'il n'existe pas
if (!fs.existsSync(BUG_REPORT_PATH)) {
    fs.writeFileSync(BUG_REPORT_PATH, JSON.stringify([], null, 2));
}

module.exports = [
    {
        pattern: "bugreport",
        react: "🐞",
        desc: "Signaler un bug au développeur",
        category: "bug",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, pushname }) {
            if (!text) return reply("❌ Veuillez décrire le bug après la commande\nEx: .bugreport La commande X ne fonctionne pas");

            const bugData = {
                id: Date.now(),
                reporter: pushname,
                userId: m.sender,
                description: text,
                status: "open",
                timestamp: new Date().toISOString()
            };

            try {
                const bugs = JSON.parse(fs.readFileSync(BUG_REPORT_PATH));
                bugs.push(bugData);
                fs.writeFileSync(BUG_REPORT_PATH, JSON.stringify(bugs, null, 2));
                
                // Notifier le propriétaire
                const ownerMessage = `🐞 NOUVEAU BUG SIGNALÉ 🐞\n\n` +
                                    `👤 Par: ${pushname}\n` +
                                    `🆔 ID: ${bugData.id}\n` +
                                    `📝 Description: ${text}\n\n` +
                                    `Utilisez .buginfo ${bugData.id} pour plus de détails`;
                
                await conn.sendMessage(config.OWNER_NUMBER, { text: ownerMessage });
                
                reply(`✅ Bug signalé avec succès! ID: ${bugData.id}\nLe développeur sera notifié.`);
            } catch (e) {
                console.error("Erreur bugreport:", e);
                reply("❌ Échec du signalement du bug. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "buginfo",
        react: "🔍",
        desc: "Voir les détails d'un bug signalé",
        category: "bug",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply, args }) {
            const bugId = parseInt(args[1]);
            if (!bugId) return reply("❌ Veuillez spécifier un ID de bug\nEx: .buginfo 123456");

            try {
                const bugs = JSON.parse(fs.readFileSync(BUG_REPORT_PATH));
                const bug = bugs.find(b => b.id === bugId);
                
                if (!bug) return reply("❌ Aucun bug trouvé avec cet ID");
                
                const bugInfo = `🐞 BUG REPORT #${bug.id} 🐞\n\n` +
                                `👤 Signalé par: ${bug.reporter}\n` +
                                `🆔 User ID: ${bug.userId}\n` +
                                `📅 Date: ${new Date(bug.timestamp).toLocaleString()}\n` +
                                `📝 Description:\n${bug.description}\n\n` +
                                `🟢 Statut: ${bug.status === "open" ? "OUVERT" : "RÉSOLU"}\n\n` +
                                `Commandes:\n` +
                                `• .bugstatus ${bug.id} resolved\n` +
                                `• .bugstatus ${bug.id} open`;
                
                reply(bugInfo);
            } catch (e) {
                console.error("Erreur buginfo:", e);
                reply("❌ Erreur lors de la récupération des informations du bug");
            }
        }
    },
    {
        pattern: "bugstatus",
        react: "🔄",
        desc: "Modifier le statut d'un bug",
        category: "bug",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply, args }) {
            const bugId = parseInt(args[1]);
            const status = args[2]?.toLowerCase();
            
            if (!bugId || !status || !['open', 'resolved'].includes(status)) 
                return reply("❌ Usage: .bugstatus [id] [open/resolved]");

            try {
                const bugs = JSON.parse(fs.readFileSync(BUG_REPORT_PATH));
                const bugIndex = bugs.findIndex(b => b.id === bugId);
                
                if (bugIndex === -1) return reply("❌ Aucun bug trouvé avec cet ID");
                
                bugs[bugIndex].status = status;
                fs.writeFileSync(BUG_REPORT_PATH, JSON.stringify(bugs, null, 2));
                
                // Notifier le reporter
                const statusMsg = `🔄 Statut de votre bug #${bugId} mis à jour: ${status.toUpperCase()}`;
                await conn.sendMessage(bugs[bugIndex].userId, { text: statusMsg });
                
                reply(`✅ Statut du bug #${bugId} mis à jour: ${status}`);
            } catch (e) {
                console.error("Erreur bugstatus:", e);
                reply("❌ Échec de la mise à jour du statut du bug");
            }
        }
    },
    {
        pattern: "buglist",
        react: "📋",
        desc: "Lister tous les bugs signalés",
        category: "bug",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply }) {
            try {
                const bugs = JSON.parse(fs.readFileSync(BUG_REPORT_PATH));
                
                if (bugs.length === 0) return reply("✅ Aucun bug signalé pour le moment");
                
                let bugList = `🐞 LISTE DES BUGS SIGNALÉS (${bugs.length}) 🐞\n\n`;
                
                bugs.forEach(bug => {
                    bugList += `🆔 #${bug.id} - ${bug.status === "open" ? "🟢 OUVERT" : "🔴 RÉSOLU"}\n` +
                               `👤 ${bug.reporter}\n` +
                               `📝 ${bug.description.substring(0, 50)}${bug.description.length > 50 ? '...' : ''}\n` +
                               `⏰ ${new Date(bug.timestamp).toLocaleDateString()}\n\n`;
                });
                
                bugList += `Utilisez .buginfo [id] pour plus de détails`;
                
                reply(bugList);
            } catch (e) {
                console.error("Erreur buglist:", e);
                reply("❌ Erreur lors de la récupération de la liste des bugs");
            }
        }
    },
    {
        pattern: "antipurge",
        react: "🛡️",
        desc: "Activer/désactiver la protection anti-purge",
        category: "bug",
        filename: __filename,
        async handler(conn, mek, m, { reply, args, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .antipurge [on/off]");
            
            // Sauvegarder le paramètre
            config.groupSettings = config.groupSettings || {};
            config.groupSettings[m.chat] = config.groupSettings[m.chat] || {};
            config.groupSettings[m.chat].antipurge = action === 'on';
            
            reply(`✅ Protection anti-purge ${action === 'on' ? 'activée' : 'désactivée'}`);
        }
    },
    {
        pattern: "purge",
        react: "🧹",
        desc: "Supprimer les messages d'un membre (purge)",
        category: "bug",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned, groupMetadata }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            if (!mentioned || mentioned.length === 0) 
                return reply("❌ Mentionnez un membre à purger");
            
            const target = mentioned[0];
            const purgeCount = parseInt(args[2]) || 10; // Par défaut 10 messages
            
            try {
                // Récupérer les messages du membre
                const messages = await conn.loadMessages(m.chat, purgeCount * 2);
                const userMessages = messages.filter(msg => 
                    msg.key.fromMe === false && 
                    msg.key.participant === target
                ).slice(0, purgeCount);
                
                if (userMessages.length === 0) 
                    return reply("❌ Aucun message trouvé à supprimer");
                
                // Supprimer les messages
                await Promise.all(userMessages.map(msg => 
                    conn.sendMessage(m.chat, { delete: msg.key })
                ));
                
                reply(`✅ ${userMessages.length} messages de @${target.split('@')[0]} supprimés`, {
                    mentions: [target]
                });
            } catch (e) {
                console.error("Erreur purge:", e);
                reply("❌ Échec de la suppression des messages");
            }
        }
    },
    {
        pattern: "restrict",
        react: "🔐",
        desc: "Gérer les restrictions du groupe",
        category: "bug",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            if (!m.isGroup) return reply("❌ Groupes uniquement");
            if (!m.isAdmin) return reply("❌ Admins uniquement");
            
            const restrictionType = args[1]?.toLowerCase();
            const validTypes = ['all', 'none', 'links', 'media', 'commands'];
            
            if (!restrictionType || !validTypes.includes(restrictionType)) 
                return reply(`❌ Usage: .restrict [type]\nTypes valides: ${validTypes.join(', ')}`);
            
            // Sauvegarder le paramètre
            config.groupSettings = config.groupSettings || {};
            config.groupSettings[m.chat] = config.groupSettings[m.chat] || {};
            config.groupSettings[m.chat].restrictions = restrictionType;
            
            const restrictionMap = {
                'all': "Toutes les actions restreintes",
                'none': "Aucune restriction",
                'links': "Liens bloqués",
                'media': "Médias bloqués",
                'commands': "Commandes bloquées"
            };
            
            reply(`✅ Restrictions du groupe mises à jour: ${restrictionMap[restrictionType]}`);
        }
    },
    {
        pattern: "lockdown",
        react: "🚨",
        desc: "Mode lockdown (urgence)",
        category: "bug",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply }) {
            // Mettre le bot en mode maintenance
            config.MODE = "maintenance";
            
            // Désactiver toutes les commandes
            config.LOCKDOWN = true;
            
            // Envoyer une notification à tous les groupes
            const groups = await conn.groupFetchAllParticipating();
            const groupIds = Object.keys(groups);
            
            for (const groupId of groupIds) {
                try {
                    await conn.sendMessage(groupId, {
                        text: "🚨 *LOCKDOWN ACTIVÉ* 🚨\n\n" +
                              "Le bot est en mode maintenance. Toutes les commandes sont temporairement désactivées.\n" +
                              "Nous nous excusons pour la gêne occasionnée."
                    });
                } catch (e) {
                    console.error(`Échec d'envoi à ${groupId}:`, e);
                }
            }
            
            reply("🔒 Mode lockdown activé avec succès. Toutes les commandes sont désactivées.");
        }
    },
    {
        pattern: "unlock",
        react: "🔓",
        desc: "Désactiver le mode lockdown",
        category: "bug",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply }) {
            // Restaurer le mode normal
            config.MODE = "public";
            config.LOCKDOWN = false;
            
            // Envoyer une notification à tous les groupes
            const groups = await conn.groupFetchAllParticipating();
            const groupIds = Object.keys(groups);
            
            for (const groupId of groupIds) {
                try {
                    await conn.sendMessage(groupId, {
                        text: "✅ *LOCKDOWN DÉSACTIVÉ* ✅\n\n" +
                              "Le bot est de nouveau opérationnel. Merci de votre patience !"
                    });
                } catch (e) {
                    console.error(`Échec d'envoi à ${groupId}:`, e);
                }
            }
            
            reply("🔓 Mode lockdown désactivé. Le bot est de nouveau opérationnel.");
        }
    },
    {
        pattern: "diagnose",
        react: "🩺",
        desc: "Diagnostiquer l'état du bot",
        category: "bug",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply }) {
            // Calculer l'uptime
            const uptime = process.uptime();
            const days = Math.floor(uptime / (3600 * 24));
            const hours = Math.floor((uptime % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            
            // Vérifier les ressources système
            const memoryUsage = process.memoryUsage();
            const memoryPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
            
            // Vérifier la connexion internet
            let internetStatus = "🔴 Hors ligne";
            try {
                await axios.get('https://www.google.com', { timeout: 3000 });
                internetStatus = "🟢 En ligne";
            } catch {}
            
            // Vérifier la connexion à la base de données
            let dbStatus = "🔴 Échec";
            try {
                const bugs = JSON.parse(fs.readFileSync(BUG_REPORT_PATH));
                dbStatus = `🟢 Connecté (${bugs.length} bugs)`;
            } catch {}
            
            const diagnostics = `
🩺 *DIAGNOSTIC DU BOT* 🩺

🖥️ *Système:*
• Uptime: ${days}j ${hours}h ${minutes}m
• Mémoire: ${memoryPercent}% utilisée
• Internet: ${internetStatus}
• Base de données: ${dbStatus}

⚙️ *Configuration:*
• Mode: ${config.MODE}
• Prefixe: ${config.PREFIX}
• Version: ${config.version}
• Lockdown: ${config.LOCKDOWN ? "🔴 Actif" : "🟢 Inactif"}

📊 *Statistiques:*
• Groupes actifs: ${Object.keys(await conn.groupFetchAllParticipating()).length}
• Commandes chargées: ${commands.length}
• Bugs signalés: ${bugs.length}
`;

            reply(diagnostics);
        }
    }
];
