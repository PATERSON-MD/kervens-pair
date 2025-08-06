const { lite } = require('../lite');
const config = require('../settings');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { getBuffer } = require('../utils');

// Dossiers de travail
const TMP_DIR = path.join(__dirname, '../tmp');
const SESSION_DIR = path.join(__dirname, '../session');

module.exports = [
    {
        pattern: "public",
        react: "🌐",
        desc: "Activer le mode public",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            config.MODE = "public";
            reply("✅ Mode public activé\nTout le monde peut utiliser le bot");
        }
    },
    {
        pattern: "private",
        react: "🔒",
        desc: "Activer le mode privé",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            config.MODE = "private";
            reply("🔒 Mode privé activé\nSeuls les admins peuvent utiliser le bot");
        }
    },
    {
        pattern: "autostatus",
        react: "🔄",
        desc: "Activer/désactiver le statut automatique",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .autostatus [on/off]");
            
            config.AUTO_STATUS = action === 'on';
            reply(`✅ Statut automatique ${action === 'on' ? 'activé' : 'désactivé'}`);
            
            if (config.AUTO_STATUS) {
                // Exemple de mise à jour de statut
                const statuses = [
                    "🤖 Servant la communauté",
                    "⚡ Paterson-MD en action",
                    "💡 Utilisez .menu pour commencer"
                ];
                
                setInterval(async () => {
                    try {
                        const status = statuses[Math.floor(Math.random() * statuses.length)];
                        await conn.updateProfileStatus(status);
                    } catch (e) {
                        console.error("Erreur autostatus:", e);
                    }
                }, 3600000); // Toutes les heures
            }
        }
    },
    {
        pattern: "autoread",
        react: "👁️",
        desc: "Activer/désactiver la lecture automatique",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .autoread [on/off]");
            
            config.AUTO_READ = action === 'on';
            reply(`✅ Lecture automatique ${action === 'on' ? 'activée' : 'désactivée'}`);
        }
    },
    {
        pattern: "clearsession",
        react: "🧹",
        desc: "Nettoyer la session du bot",
        category: "tools",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply }) {
            try {
                const files = fs.readdirSync(SESSION_DIR);
                let deletedCount = 0;
                
                files.forEach(file => {
                    if (file !== 'creds.json') {
                        fs.unlinkSync(path.join(SESSION_DIR, file));
                        deletedCount++;
                    }
                });
                
                reply(`🧹 Session nettoyée! ${deletedCount} fichiers supprimés`);
            } catch (e) {
                console.error("Erreur clearsession:", e);
                reply("❌ Échec du nettoyage de la session");
            }
        }
    },
    {
        pattern: "antidelete",
        react: "🛡️",
        desc: "Activer/désactiver la détection des messages supprimés",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .antidelete [on/off]");
            
            config.ANTI_DELETE = action === 'on';
            reply(`✅ Anti-suppression ${action === 'on' ? 'activé' : 'désactivé'}`);
        }
    },
    {
        pattern: "cleartmp",
        react: "🧼",
        desc: "Nettoyer le dossier temporaire",
        category: "tools",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply }) {
            try {
                const files = fs.readdirSync(TMP_DIR);
                let deletedCount = 0;
                
                files.forEach(file => {
                    const filePath = path.join(TMP_DIR, file);
                    if (fs.statSync(filePath).isFile()) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    }
                });
                
                reply(`🧼 Dossier tmp nettoyé! ${deletedCount} fichiers supprimés`);
            } catch (e) {
                console.error("Erreur cleartmp:", e);
                reply("❌ Échec du nettoyage du dossier tmp");
            }
        }
    },
    {
        pattern: "autoreact",
        react: "🤖",
        desc: "Activer/désactiver la réaction automatique",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .autoreact [on/off]");
            
            config.AUTO_REACT = action === 'on';
            reply(`✅ Réaction automatique ${action === 'on' ? 'activée' : 'désactivée'}`);
        }
    },
    {
        pattern: "getpp",
        react: "🖼️",
        alias: ["profilepic", "pp"],
        desc: "Récupérer la photo de profil",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { from, reply, mentioned, quoted, groupMetadata }) {
            try {
                let jid, user;
                
                if (mek.message?.extendedTextMessage?.contextInfo?.participant) {
                    jid = mek.message.extendedTextMessage.contextInfo.participant;
                    user = jid.split('@')[0];
                } else if (mentioned && mentioned.length > 0) {
                    jid = mentioned[0];
                    user = jid.split('@')[0];
                } else if (quoted) {
                    jid = quoted.sender;
                    user = jid.split('@')[0];
                } else {
                    if (from.endsWith('@g.us')) {
                        jid = from;
                        user = "Groupe";
                    } else {
                        jid = m.sender;
                        user = jid.split('@')[0];
                    }
                }

                const caption = `🖼️ Photo de profil ${user === "Groupe" ? "du groupe" : "de l'utilisateur"}`;
                
                try {
                    const ppUrl = await conn.profilePictureUrl(jid, 'image');
                    await conn.sendMessage(
                        from,
                        { 
                            image: { url: ppUrl },
                            caption: caption,
                            mentions: [jid]
                        },
                        { quoted: mek }
                    );
                } catch (ppError) {
                    if (ppError.status === 404) {
                        reply(`❌ Photo de profil non disponible pour ${user === "Groupe" ? "ce groupe" : "cet utilisateur"}`);
                    } else {
                        throw ppError;
                    }
                }

            } catch (e) {
                console.error('Erreur getpp:', e);
                reply(`❌ Erreur: ${e.message}`);
            }
        }
    },
    {
        pattern: "setpp",
        react: "🖼️",
        desc: "Changer la photo de profil du bot",
        category: "tools",
        filename: __filename,
        fromMe: true,
        async handler(conn, mek, m, { reply, quoted }) {
            if (!quoted) return reply("❌ Répondez à une image");
            
            try {
                const buffer = await conn.downloadMediaMessage(quoted);
                
                await conn.updateProfilePicture(config.OWNER_NUMBER, buffer);
                reply("✅ Photo de profil mise à jour avec succès!");
            } catch (e) {
                console.error("Erreur setpp:", e);
                reply("❌ Échec de la mise à jour de la photo de profil");
            }
        }
    },
    {
        pattern: "autobio",
        react: "🤖",
        desc: "Activer/désactiver la bio automatique",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .autobio [on/off]");
            
            config.AUTO_BIO = action === 'on';
            reply(`✅ Bio automatique ${action === 'on' ? 'activée' : 'désactivée'}`);
            
            if (config.AUTO_BIO) {
                // Exemple de bio dynamique
                setInterval(async () => {
                    try {
                        const time = new Date().toLocaleTimeString();
                        const bio = `⏰ ${time} | 🤖 ${config.BOT_NAME}`;
                        await conn.updateProfileStatus(bio);
                    } catch (e) {
                        console.error("Erreur autobio:", e);
                    }
                }, 600000); // Toutes les 10 minutes
            }
        }
    },
    {
        pattern: "autotyping",
        react: "⌨️",
        desc: "Activer/désactiver l'indicateur de saisie",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .autotyping [on/off]");
            
            config.AUTO_TYPING = action === 'on';
            reply(`✅ Indicateur de saisie ${action === 'on' ? 'activé' : 'désactivé'}`);
        }
    },
    {
        pattern: "autorecording",
        react: "🎙️",
        desc: "Activer/désactiver l'indicateur d'enregistrement",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, args }) {
            const action = args[1]?.toLowerCase();
            if (!action || !['on', 'off'].includes(action)) 
                return reply("❌ Usage: .autorecording [on/off]");
            
            config.AUTO_RECORDING = action === 'on';
            reply(`✅ Indicateur d'enregistrement ${action === 'on' ? 'activé' : 'désactivé'}`);
        }
    },
    {
        pattern: "sticker",
        react: "🖼️",
        desc: "Créer un sticker à partir d'une image",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted }) {
            if (!quoted) return reply("❌ Répondez à une image");
            
            try {
                const buffer = await conn.downloadMediaMessage(quoted);
                const packName = "Paterson-MD";
                const authorName = config.OWNER_NAME;
                
                await conn.sendMessage(
                    m.chat,
                    {
                        sticker: buffer,
                        contextInfo: {
                            externalAdReply: {
                                title: packName,
                                body: `Créé par ${authorName}`,
                                thumbnail: await getBuffer("https://i.ibb.co/Mx4v92Dr/malvin-xd.jpg")
                            }
                        }
                    },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur sticker:", e);
                reply("❌ Échec de la création du sticker");
            }
        }
    },
    {
        pattern: "toimg",
        react: "🔄",
        alias: ["simage"],
        desc: "Convertir un sticker en image",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted }) {
            if (!quoted) return reply("❌ Répondez à un sticker");
            if (!quoted.message?.stickerMessage) 
                return reply("❌ Le message cité n'est pas un sticker");
            
            try {
                const buffer = await conn.downloadMediaMessage(quoted);
                
                await conn.sendMessage(
                    m.chat,
                    { image: buffer },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur toimg:", e);
                reply("❌ Échec de la conversion du sticker en image");
            }
        }
    },
    {
        pattern: "blur",
        react: "🌀",
        desc: "Appliquer un effet flou à une image",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted }) {
            if (!quoted) return reply("❌ Répondez à une image");
            
            try {
                const buffer = await conn.downloadMediaMessage(quoted);
                const tmpPath = path.join(TMP_DIR, `blur_${Date.now()}.jpg`);
                
                fs.writeFileSync(tmpPath, buffer);
                
                await new Promise((resolve, reject) => {
                    ffmpeg(tmpPath)
                        .blur(15) // Intensité du flou
                        .output(path.join(TMP_DIR, `blurred_${Date.now()}.jpg`))
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                });
                
                const blurredBuffer = fs.readFileSync(tmpPath);
                await conn.sendMessage(
                    m.chat,
                    { image: blurredBuffer },
                    { quoted: mek }
                );
                
                fs.unlinkSync(tmpPath);
            } catch (e) {
                console.error("Erreur blur:", e);
                reply("❌ Échec de l'application de l'effet flou");
            }
        }
    },
    {
        pattern: "ocr",
        react: "🔍",
        desc: "Reconnaître le texte dans une image",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted }) {
            if (!quoted) return reply("❌ Répondez à une image contenant du texte");
            
            try {
                const buffer = await conn.downloadMediaMessage(quoted);
                const tmpPath = path.join(TMP_DIR, `ocr_${Date.now()}.jpg`);
                fs.writeFileSync(tmpPath, buffer);
                
                const form = new FormData();
                form.append('file', fs.createReadStream(tmpPath));
                
                const { data } = await axios.post('https://api.ocr.space/parse/image', form, {
                    headers: {
                        ...form.getHeaders(),
                        'apikey': config.OCR_API_KEY
                    }
                });
                
                if (data.ParsedResults && data.ParsedResults.length > 0) {
                    const text = data.ParsedResults[0].ParsedText;
                    reply(`🔍 Texte reconnu:\n\n${text}`);
                } else {
                    reply("❌ Aucun texte détecté dans l'image");
                }
                
                fs.unlinkSync(tmpPath);
            } catch (e) {
                console.error("Erreur ocr:", e);
                reply("❌ Échec de la reconnaissance de texte");
            }
        }
    },
    {
        pattern: "qrcode",
        react: "📇",
        alias: ["qr"],
        desc: "Générer ou lire un QR code",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, quoted }) {
            // Mode lecture de QR code
            if (quoted && quoted.message?.imageMessage) {
                try {
                    const buffer = await conn.downloadMediaMessage(quoted);
                    const tmpPath = path.join(TMP_DIR, `qrcode_${Date.now()}.jpg`);
                    fs.writeFileSync(tmpPath, buffer);
                    
                    const { data } = await axios.get(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(tmpPath)}`);
                    
                    if (data[0].symbol[0].data) {
                        reply(`🔍 QR Code décodé:\n\n${data[0].symbol[0].data}`);
                    } else {
                        reply("❌ Aucun QR Code détecté dans l'image");
                    }
                    
                    fs.unlinkSync(tmpPath);
                } catch (e) {
                    console.error("Erreur qrcode scan:", e);
                    reply("❌ Échec de la lecture du QR Code");
                }
                return;
            }
            
            // Mode génération de QR code
            if (!text) return reply("❌ Veuillez entrer le texte pour générer un QR code");
            
            try {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
                
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: qrUrl },
                        caption: `📇 QR Code pour:\n${text}`
                    },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur qrcode generate:", e);
                reply("❌ Échec de la génération du QR Code");
            }
        }
    },
    {
        pattern: "translate",
        react: "🌐",
        alias: ["tr"],
        desc: "Traduire du texte",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, args }) {
            if (!text) return reply("❌ Veuillez entrer le texte à traduire");
            
            try {
                const targetLang = args[1] || 'fr'; // Français par défaut
                const { data } = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`);
                
                if (data.responseData && data.responseData.translatedText) {
                    reply(`🌐 Traduction (${targetLang.toUpperCase()}):\n\n${data.responseData.translatedText}`);
                } else {
                    reply("❌ Échec de la traduction");
                }
            } catch (e) {
                console.error("Erreur translate:", e);
                reply("❌ Service de traduction indisponible");
            }
        }
    },
    {
        pattern: "calc",
        react: "🧮",
        desc: "Calculatrice",
        category: "tools",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez entrer une expression mathématique");
            
            try {
                // Évaluation sécurisée
                const safeEval = (expr) => {
                    // Liste blanche de fonctions autorisées
                    const allowed = ['sin', 'cos', 'tan', 'log', 'sqrt', 'pow', 'PI', 'E'];
                    
                    // Vérification des caractères dangereux
                    if (/[^0-9+\-*/()., ]/.test(expr)) {
                        throw new Error("Expression
