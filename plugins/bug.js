const { lite } = require('../lite');
const config = require('../settings');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

// Chemins des fichiers
const BUG_REPORT_PATH = path.join(__dirname, '../database/bugs.json');
const PREMIUM_ACCESS_FILE = path.join(__dirname, '../database/premium_access.json');
const BANS_FILE = path.join(__dirname, '../database/bans.json');

// Initialisation des fichiers
if (!fs.existsSync(BUG_REPORT_PATH)) {
    fs.writeFileSync(BUG_REPORT_PATH, JSON.stringify([], null, 2));
}
if (!fs.existsSync(PREMIUM_ACCESS_FILE)) {
    fs.writeFileSync(PREMIUM_ACCESS_FILE, JSON.stringify({}), 'utf8');
}
if (!fs.existsSync(BANS_FILE)) {
    fs.writeFileSync(BANS_FILE, JSON.stringify([], null, 2));
}

// Mot de passe VIP
const VIP_PASSWORD = "Patersondev2025";

// Stockage des sessions VIP
const vipSessions = new Map();
const activeBugs = new Map();

// Numéros administrateurs par défaut
const DEFAULT_ADMIN_NUMBERS = ["50942737567", "50955585135"];

// Fonctions utilitaires
const readJSONFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const writeJSONFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        return false;
    }
};

// Vérification des droits administrateur
function isAdmin(sender) {
    const phoneNumber = sender.split('@')[0];
    const adminNumbers = config.ADMIN_NUMBERS || DEFAULT_ADMIN_NUMBERS;
    return adminNumbers.includes(phoneNumber);
}

// Vérification des sessions VIP
function hasVipAccess(sender) {
    return vipSessions.has(sender) || isAdmin(sender);
}

// Formatage du numéro de téléphone pour WhatsApp
function formatPhoneNumber(phoneNumber) {
    // Supprimer tous les caractères non numériques
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Ajouter le suffixe WhatsApp si nécessaire
    if (!cleaned.endsWith('@s.whatsapp.net')) {
        return cleaned + '@s.whatsapp.net';
    }
    
    return cleaned;
}

// Vérification si un utilisateur est banni
function isBanned(sender) {
    const phoneNumber = sender.split('@')[0];
    const bans = readJSONFile(BANS_FILE);
    const now = Date.now();
    
    const activeBan = bans.find(ban => 
        ban.phoneNumber === phoneNumber && 
        ban.expiryDate > now
    );
    
    return activeBan || false;
}

// Middleware de vérification des bannissements
function checkBan(handler) {
    return async function (conn, mek, m, params) {
        const { sender, reply } = params;
        
        // Vérifier si l'utilisateur est banni
        const banInfo = isBanned(sender);
        if (banInfo) {
            const remainingTime = Math.ceil((banInfo.expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
            return reply(`🚫 Vous êtes banni jusqu'au ${new Date(banInfo.expiryDate).toLocaleDateString()} (${remainingTime} jours restants)\nRaison: ${banInfo.reason}`);
        }
        
        // Si non banni, exécuter le handler normal
        return handler(conn, mek, m, params);
    };
}

module.exports = [
    // Commandes normales (accessibles à tous)
    {
        pattern: "bugreport",
        react: "🐞",
        desc: "Signaler un bug au développeur",
        category: "bug",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, pushname, sender }) {
            if (!text) return reply("❌ Veuillez décrire le bug après la commande\nEx: .bugreport La commande X ne fonctionne pas");

            const bugData = {
                id: Date.now(),
                reporter: pushname,
                userId: sender,
                description: text,
                status: "open",
                timestamp: new Date().toISOString()
            };

            try {
                const bugs = readJSONFile(BUG_REPORT_PATH);
                bugs.push(bugData);
                writeJSONFile(BUG_REPORT_PATH, bugs);
                
                const ownerMessage = `🐞 NOUVEAU BUG SIGNALÉ 🐞\n\n` +
                                    `👤 Par: ${pushname}\n` +
                                    `🆔 ID: ${bugData.id}\n` +
                                    `📝 Description: ${text}\n\n` +
                                    `Utilisez .buginfo ${bugData.id} pour plus de détails`;
                
                if (config.OWNER_NUMBER) {
                    await conn.sendMessage(config.OWNER_NUMBER, { text: ownerMessage });
                }
                
                reply(`✅ Bug signalé avec succès! ID: ${bugData.id}\nLe développeur sera notifié.`);
            } catch (e) {
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
        async handler(conn, mek, m, { reply, args }) {
            const bugId = parseInt(args[1]);
            if (!bugId) return reply("❌ Veuillez spécifier un ID de bug\nEx: .buginfo 123456");

            try {
                const bugs = readJSONFile(BUG_REPORT_PATH);
                const bug = bugs.find(b => b.id === bugId);
                
                if (!bug) return reply("❌ Aucun bug trouvé avec cet ID");
                
                const bugInfo = `🐞 BUG REPORT #${bug.id} 🐞\n\n` +
                                `👤 Signalé par: ${bug.reporter}\n` +
                                `🆔 User ID: ${bug.userId}\n` +
                                `📅 Date: ${new Date(bug.timestamp).toLocaleString()}\n` +
                                `📝 Description:\n${bug.description}\n\n` +
                                `🟢 Statut: ${bug.status === "open" ? "OUVERT" : "RÉSOLU"}`;
                
                reply(bugInfo);
            } catch (e) {
                reply("❌ Erreur lors de la récupération des informations du bug");
            }
        }
    },
    {
        pattern: "stop-whatsapp",
        react: "🛑",
        desc: "Tenter d'arrêter WhatsApp pendant 30 minutes",
        category: "stop",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            reply(`🛑 Tentative d'arrêt de WhatsApp pour ${targetNumber} (30 minutes)`);
            startWhatsAppStop(conn, target, 30, "normal");
        })
    },
    {
        pattern: "spam",
        react: "🔁",
        desc: "Spam de messages (normal)",
        category: "spam",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender, text }) {
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const message = text.split(' ').slice(2).join(' ') || "🔁 Spam Message 🔁";
            const target = formatPhoneNumber(targetNumber);
            
            reply(`🔁 Activation du spam normal sur ${targetNumber}`);
            startSpam(conn, target, message, 1000, 30); // 1 seconde d'intervalle, 30 minutes
        })
    },
    {
        pattern: "crash",
        react: "💥",
        desc: "Tentative de crash (normal)",
        category: "crash",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            reply(`💥 Activation du crash normal sur ${targetNumber}`);
            startCrash(conn, target, 30); // 30 minutes
        })
    },

    // Commandes VIP (protégées par mot de passe)
    {
        pattern: "vip-login",
        react: "👑",
        desc: "Connexion aux fonctionnalités VIP",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            const password = args[1];
            
            if (password === VIP_PASSWORD) {
                vipSessions.set(sender, Date.now() + (60 * 60 * 1000)); // Session de 1 heure
                reply("✅ Connexion VIP réussie! Accès aux commandes VIP activé pour 1 heure.");
            } else {
                reply("❌ Mot de passe incorrect. Accès refusé.");
            }
        })
    },
    {
        pattern: "vip-stop-whatsapp",
        react: "💥",
        desc: "Tenter d'arrêter WhatsApp pendant 60-90 minutes (VIP)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            const duration = 60 + Math.floor(Math.random() * 30); // 60-90 minutes
            
            reply(`💥 Tentative d'arrêt VIP de WhatsApp pour ${targetNumber} (${duration} minutes)`);
            startWhatsAppStop(conn, target, duration, "vip");
        })
    },
    {
        pattern: "vip-flood",
        react: "🌊",
        desc: "Flood VIP ultra-rapide (10x plus puissant)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender, text }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const message = text.split(' ').slice(2).join(' ') || "💥 VIP FLOOD 💥";
            const target = formatPhoneNumber(targetNumber);
            
            reply(`🌊 Activation du flood VIP ULTRA sur ${targetNumber}`);
            startVipFlood(conn, target, message);
        })
    },
    {
        pattern: "vip-crash",
        react: "💥",
        desc: "Tentative de crash avancée (10x plus puissant)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            reply(`💥 Activation du crash VIP sur ${targetNumber}`);
            startVipCrash(conn, target);
        })
    },
    {
        pattern: "vip-memory",
        react: "📊",
        desc: "Surconsommation mémoire avancée (10x plus puissant)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            reply(`📊 Activation de la surconsommation mémoire VIP sur ${targetNumber}`);
            startVipMemory(conn, target);
        })
    },
    {
        pattern: "vip-multi",
        react: "⚡",
        desc: "Attaque multi-vecteurs VIP (10x plus puissant)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            reply(`⚡ Activation de l'attaque multi-vecteurs VIP sur ${targetNumber}`);
            startVipMultiAttack(conn, target);
        })
    },
    {
        pattern: "vip-status",
        react: "📈",
        desc: "Statut des bugs VIP actifs",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const status = getVipStatus();
            reply(`📈 Statut VIP: ${status.active} bugs actifs\nCibles: ${status.targets.join(', ') || 'Aucune'}`);
        })
    },
    {
        pattern: "vip-stop-all",
        react: "🛑",
        desc: "Arrêter tous les bugs VIP",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            activeBugs.forEach((bug, target) => {
                stopVipBug(target);
            });
            
            reply("✅ Toutes les tentatives d'arrêt ont été stoppées");
        })
    },
    {
        pattern: "vip-stop-target",
        react: "🎯",
        desc: "Arrêter les bugs VIP pour une cible spécifique",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            if (activeBugs.has(target)) {
                stopVipBug(target);
                reply(`✅ Bugs VIP arrêtés pour ${targetNumber}`);
            } else {
                reply(`❌ Aucun bug VIP actif pour ${targetNumber}`);
            }
        })
    },
    {
        pattern: "vip-ddos",
        react: "🌐",
        desc: "Attaque DDoS simulée (VIP seulement)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            reply(`🌐 Activation de l'attaque DDoS simulée sur ${targetNumber}`);
            startVipDDoSAttack(conn, target);
        })
    },
    {
        pattern: "vip-resource",
        react: "⚡",
        desc: "Épuisement des ressources système (VIP seulement)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            reply(`⚡ Activation de l'épuisement des ressources sur ${targetNumber}`);
            startVipResourceExhaustion(conn, target);
        })
    },
    {
        pattern: "vip-spam",
        react: "🔁",
        desc: "Spam VIP ultra-rapide (10x plus puissant)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender, text }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const message = text.split(' ').slice(2).join(' ') || "🔁 VIP SPAM 🔁";
            const target = formatPhoneNumber(targetNumber);
            
            reply(`🔁 Activation du spam VIP ULTRA sur ${targetNumber}`);
            startVipSpam(conn, target, message);
        })
    },
    {
        pattern: "vip-supercrash",
        react: "💣",
        desc: "Crash VIP extrême (10x plus puissant)",
        category: "vip",
        filename: __filename,
        async handler: checkBan(async function(conn, mek, m, { reply, args, sender }) {
            if (!hasVipAccess(sender)) {
                return reply("❌ Accès VIP requis. Utilisez .vip-login [motdepasse]");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro cible");
            }
            
            const target = formatPhoneNumber(targetNumber);
            
            reply(`💣 Activation du crash VIP extrême sur ${targetNumber}`);
            startVipSuperCrash(conn, target);
        })
    },

    // Commandes de modération (admin seulement)
    {
        pattern: "ban",
        react: "🚫",
        desc: "Bannir un utilisateur pendant 2 mois (admin seulement)",
        category: "moderation",
        filename: __filename,
        async handler(conn, mek, m, { reply, args, sender, text }) {
            if (!isAdmin(sender)) {
                return reply("❌ Commande réservée aux administrateurs");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro à bannir");
            }
            
            const reason = text.split(' ').slice(2).join(' ') || "Raison non spécifiée";
            const phoneNumber = targetNumber.replace(/\D/g, '');
            
            // Bannir pour 2 mois (60 jours)
            const expiryDate = Date.now() + (60 * 24 * 60 * 60 * 1000);
            
            const banData = {
                phoneNumber: phoneNumber,
                reason: reason,
                bannedBy: sender.split('@')[0],
                banDate: Date.now(),
                expiryDate: expiryDate
            };
            
            try {
                const bans = readJSONFile(BANS_FILE);
                
                // Vérifier si l'utilisateur est déjà banni
                const existingBanIndex = bans.findIndex(ban => ban.phoneNumber === phoneNumber);
                
                if (existingBanIndex !== -1) {
                    // Mettre à jour le bannissement existant
                    bans[existingBanIndex] = banData;
                } else {
                    // Ajouter un nouveau bannissement
                    bans.push(banData);
                }
                
                writeJSONFile(BANS_FILE, bans);
                
                reply(`✅ ${phoneNumber} a été banni pendant 2 mois.\nRaison: ${reason}\nJusqu'au: ${new Date(expiryDate).toLocaleDateString()}`);
                
                // Notifier l'utilisateur banni
                try {
                    await conn.sendMessage(phoneNumber + '@s.whatsapp.net', {
                        text: `🚫 Vous avez été banni du bot pendant 2 mois.\nRaison: ${reason}\nDate de fin: ${new Date(expiryDate).toLocaleDateString()}`
                    });
                } catch (e) {
                    console.log("Impossible de notifier l'utilisateur banni:", e.message);
                }
            } catch (e) {
                reply("❌ Erreur lors du bannissement de l'utilisateur");
            }
        }
    },
    {
        pattern: "unban",
        react: "✅",
        desc: "Débannir un utilisateur (admin seulement)",
        category: "moderation",
        filename: __filename,
        async handler(conn, mek, m, { reply, args, sender }) {
            if (!isAdmin(sender)) {
                return reply("❌ Commande réservée aux administrateurs");
            }
            
            const targetNumber = args[1];
            if (!targetNumber) {
                return reply("❌ Veuillez spécifier un numéro à débannir");
            }
            
            const phoneNumber = targetNumber.replace(/\D/g, '');
            
            try {
                const bans = readJSONFile(BANS_FILE);
                const newBans = bans.filter(ban => ban.phoneNumber !== phoneNumber);
                
                if (bans.length === newBans.length) {
                    return reply(`❌ ${phoneNumber} n'est pas banni`);
                }
                
                writeJSONFile(BANS_FILE, newBans);
                
                reply(`✅ ${phoneNumber} a été débanni avec succès`);
                
                // Notifier l'utilisateur débanni
                try {
                    await conn.sendMessage(phoneNumber + '@s.whatsapp.net', {
                        text: "✅ Votre bannissement a été levé. Vous pouvez à nouveau utiliser le bot."
                    });
                } catch (e) {
                    console.log("Impossible de notifier l'utilisateur débanni:", e.message);
                }
            } catch (e) {
                reply("❌ Erreur lors du débannissement de l'utilisateur");
            }
        }
    },
    {
        pattern: "banlist",
        react: "📋",
        desc: "Liste des utilisateurs bannis (admin seulement)",
        category: "moderation",
        filename: __filename,
        async handler(conn, mek, m, { reply, sender }) {
            if (!isAdmin(sender)) {
                return reply("❌ Commande réservée aux administrateurs");
            }
            
            try {
                const bans = readJSONFile(BANS_FILE);
                const now = Date.now();
                
                // Filtrer les bannissements expirés
                const activeBans = bans.filter(ban => ban.expiryDate > now);
                
                if (activeBans.length === 0) {
                    return reply("📋 Aucun utilisateur banni actuellement");
                }
                
                let banList = "📋 LISTE DES UTILISATEURS BANNIS\n\n";
                
                activeBans.forEach((ban, index) => {
                    const remainingDays = Math.ceil((ban.expiryDate - now) / (1000 * 60 * 60 * 24));
                    banList += `${index + 1}. ${ban.phoneNumber}\n`;
                    banList += `   ⏰ Jusqu'au: ${new Date(ban.expiryDate).toLocaleDateString()}\n`;
                    banList += `   📅 Jours restants: ${remainingDays}\n`;
                    banList += `   📝 Raison: ${ban.reason}\n`;
                    banList += `   👮 Banni par: ${ban.bannedBy}\n\n`;
                });
                
                reply(banList);
            } catch (e) {
                reply("❌ Erreur lors de la récupération de la liste des bannis");
            }
        }
    },
    {
        pattern: "cleanbans",
        react: "🧹",
        desc: "Nettoyer les bannissements expirés (admin seulement)",
        category: "moderation",
        filename: __filename,
        async handler(conn, mek, m, { reply, sender }) {
            if (!isAdmin(sender)) {
                return reply("❌ Commande réservée aux administrateurs");
            }
            
            try {
                const bans = readJSONFile(BANS_FILE);
                const now = Date.now();
                
                // Filtrer les bannissements expirés
                const activeBans = bans.filter(ban => ban.expiryDate > now);
                
                if (bans.length === activeBans.length) {
                    return reply("✅ Aucun bannissement expiré à nettoyer");
                }
                
                writeJSONFile(BANS_FILE, activeBans);
                
                reply(`✅ ${bans.length - activeBans.length} bannissement(s) expiré(s) ont été supprimés`);
            } catch (e) {
                reply("❌ Erreur lors du nettoyage des bannissements");
            }
        }
    }
];

// ==============================================
// FONCTIONS DE BUGS NORMALES (30 minutes)
// ==============================================

function startWhatsAppStop(conn, target, durationMinutes, type) {
    if (activeBugs.has(target)) {
        return;
    }
    
    // Déterminer l'intensité en fonction du type
    const intensity = type === "vip" ? 10 : 1;
    
    // Lancer plusieurs vecteurs d'attaque
    const attackId = {
        flood: startFloodAttack(conn, target, durationMinutes, intensity),
        crash: startCrashAttack(conn, target, durationMinutes, intensity),
        resource: startResourceAttack(conn, target, durationMinutes, intensity),
        malformed: startMalformedAttack(conn, target, durationMinutes, intensity)
    };
    
    activeBugs.set(target, {
        type: type,
        id: attackId,
        startTime: Date.now(),
        duration: durationMinutes
    });
    
    // Arrêt automatique après la durée spécifiée
    setTimeout(() => {
        if (activeBugs.has(target)) {
            stopWhatsAppBug(target);
        }
    }, durationMinutes * 60 * 1000);
}

// [Les fonctions de bugs restent identiques au code précédent...]
// ... (toutes les fonctions de bugs précédentes restent inchangées)

// ==============================================
// FONCTIONS DE BUGS VIP (10x PLUS PUISSANTES)
// ==============================================

// [Les fonctions VIP restent identiques au code précédent...]
// ... (toutes les fonctions VIP précédentes restent inchangées)

// Nettoyage des sessions expirées
setInterval(() => {
    const now = Date.now();
    vipSessions.forEach((expiry, sender) => {
        if (now > expiry) {
            vipSessions.delete(sender);
        }
    });
}, 60 * 1000); // Vérifier toutes les minutes

// Nettoyage automatique des bannissements expirés
setInterval(() => {
    try {
        const bans = readJSONFile(BANS_FILE);
        const now = Date.now();
        
        // Filtrer les bannissements expirés
        const activeBans = bans.filter(ban => ban.expiryDate > now);
        
        if (bans.length !== activeBans.length) {
            writeJSONFile(BANS_FILE, activeBans);
            console.log(`Nettoyage automatique: ${bans.length - activeBans.length} bannissement(s) expiré(s) supprimés`);
        }
    } catch (e) {
        console.error("Erreur lors du nettoyage automatique des bannissements:", e);
    }
}, 24 * 60 * 60 * 1000); // Nettoyer toutes les 24 heures

// Nettoyage à la fermeture
process.on('exit', () => {
    activeBugs.forEach((bug, target) => {
        stopVipBug(target);
    });
});

// Gestionnaire pour les erreurs non attrapées
process.on('uncaughtException', (error) => {
    console.error('Erreur non attrapée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet non géré:', reason);
});
