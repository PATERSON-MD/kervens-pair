const { lite } = require('../lite');
const config = require('../settings');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');
const { getBuffer } = require('../utils');

// Dossier pour les fichiers temporaires
const TMP_DIR = path.join(__dirname, '../tmp');
if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
}

module.exports = [
    {
        pattern: "joke",
        react: "😂",
        alias: ["blague"],
        desc: "Une blague aléatoire pour vous faire rire",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            try {
                const jokes = [
                    "Pourquoi les plongeurs plongent-ils toujours en arrière et pas en avant ? Parce que sinon ils tombent dans le bateau !",
                    "Qu'est-ce qu'un canard qui fait le ménage ? Un canard balai !",
                    "Comment appelle-t-on un chat tombé dans un pot de peinture ? Un chat peint !",
                    "Pourquoi les livres ont-ils toujours chaud ? Parce qu'ils ont une couverture !",
                    "Quel est le comble pour un électricien ? De ne pas être au courant !",
                    "Que dit un oignon quand il se cogne ? Aïe ! J'ai mal à oignon !"
                ];
                
                const joke = jokes[Math.floor(Math.random() * jokes.length)];
                reply(`😂 Blague:\n\n${joke}`);
            } catch (e) {
                console.error("Erreur joke:", e);
                reply("❌ Je n'ai pas de blague pour le moment...");
            }
        }
    },
    {
        pattern: "quote",
        react: "💬",
        alias: ["citation"],
        desc: "Citation inspirante aléatoire",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            try {
                const quotes = [
                    "La vie est un mystère qu'il faut vivre, et non un problème à résoudre. - Gandhi",
                    "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme. - Winston Churchill",
                    "La seule façon de faire du bon travail est d'aimer ce que vous faites. - Steve Jobs",
                    "L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde. - Nelson Mandela",
                    "La liberté, c'est de choisir ses contraintes. - Jacques Attali"
                ];
                
                const quote = quotes[Math.floor(Math.random() * quotes.length)];
                reply(`💬 Citation:\n\n"${quote}"`);
            } catch (e) {
                console.error("Erreur quote:", e);
                reply("❌ Je n'ai pas de citation pour le moment...");
            }
        }
    },
    {
        pattern: "fact",
        react: "ℹ️",
        alias: ["saviezvous"],
        desc: "Fait intéressant aléatoire",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            try {
                const facts = [
                    "Les baleines bleues sont les animaux les plus bruyants de la planète. Leurs cris peuvent atteindre 188 décibels et être entendus à plus de 800 km.",
                    "Il y a plus d'arbbres sur Terre que d'étoiles dans notre galaxie. Environ 3 000 milliards contre 100 à 400 milliards.",
                    "Le cœur d'une crevette est situé dans sa tête.",
                    "Le plus court conflit de l'histoire a duré 38 minutes. C'était la guerre anglo-zanzibarienne en 1896.",
                    "Les chatons ronronnent à la même fréquence qu'un moteur diesel au ralenti, soit environ 26 ronronnements par seconde."
                ];
                
                const fact = facts[Math.floor(Math.random() * facts.length)];
                reply(`ℹ️ Saviez-vous que:\n\n${fact}`);
            } catch (e) {
                console.error("Erreur fact:", e);
                reply("❌ Je n'ai pas de fait pour le moment...");
            }
        }
    },
    {
        pattern: "tts",
        react: "🗣️",
        alias: ["voice"],
        desc: "Convertir du texte en message vocal",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez entrer le texte à convertir");
            if (text.length > 200) return reply("❌ Texte trop long (max 200 caractères)");
            
            try {
                const gtts = new gTTS(text, 'fr');
                const tmpPath = path.join(TMP_DIR, `tts_${Date.now()}.mp3`);
                
                await new Promise((resolve, reject) => {
                    gtts.save(tmpPath, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: fs.readFileSync(tmpPath),
                        mimetype: 'audio/mpeg',
                        ptt: true
                    },
                    { quoted: mek }
                );
                
                fs.unlinkSync(tmpPath);
            } catch (e) {
                console.error("Erreur TTS:", e);
                reply("❌ Échec de la conversion texte-parole");
            }
        }
    },
    {
        pattern: "lyrics",
        react: "🎶",
        alias: ["paroles"],
        desc: "Trouver les paroles d'une chanson",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez spécifier le titre de la chanson");
            
            try {
                const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(text)}`);
                
                if (!data.lyrics) return reply("❌ Paroles non trouvées pour cette chanson");
                
                // Limiter à 1000 caractères pour éviter les messages trop longs
                const lyrics = data.lyrics.length > 1000 ? 
                    data.lyrics.substring(0, 1000) + "...\n\n[Texte tronqué]" : 
                    data.lyrics;
                
                reply(`🎶 Paroles de "${text}":\n\n${lyrics}`);
            } catch (e) {
                console.error("Erreur lyrics:", e);
                reply("❌ Impossible de trouver les paroles de cette chanson");
            }
        }
    },
    {
        pattern: "attp",
        react: "🌈",
        alias: ["textcolor"],
        desc: "Créer un texte coloré animé",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez entrer le texte à animer");
            if (text.length > 20) return reply("❌ Texte trop long (max 20 caractères)");
            
            try {
                // Générer un texte coloré animé
                const colors = ['ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff'];
                let animatedText = '';
                
                for (let char of text) {
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    animatedText += `\`\`\`${char}\`\`\` `;
                }
                
                reply(animatedText);
            } catch (e) {
                console.error("Erreur attp:", e);
                reply("❌ Échec de la création du texte animé");
            }
        }
    },
    {
        pattern: "8ball",
        react: "🎱",
        alias: ["boule8"],
        desc: "Posez une question à la boule magique",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Posez une question à la boule magique");
            
            const responses = [
                "Oui, absolument !",
                "C'est certain",
                "Sans aucun doute",
                "Oui - définitivement",
                "Comptez dessus",
                "Comme je le vois, oui",
                "Probablement",
                "Les perspectives sont bonnes",
                "Oui",
                "Les signes indiquent que oui",
                "Réponse floue, essayez à nouveau",
                "Demandez plus tard",
                "Mieux vaut ne pas vous le dire maintenant",
                "Impossible de prédire maintenant",
                "Concentrez-vous et demandez à nouveau",
                "Ne comptez pas dessus",
                "Ma réponse est non",
                "Mes sources disent non",
                "Les perspectives ne sont pas très bonnes",
                "Très douteux"
            ];
            
            const response = responses[Math.floor(Math.random() * responses.length)];
            reply(`🎱 *Boule magique*\n\nQuestion: ${text}\nRéponse: ${response}`);
        }
    },
    {
        pattern: "compliment",
        react: "💐",
        desc: "Recevoir un compliment aléatoire",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, pushname }) {
            const compliments = [
                `${pushname}, ton sourire illumine la pièce !`,
                `Quelle personne incroyable tu es, ${pushname} !`,
                `${pushname}, ta présence rend tout meilleur !`,
                `Le monde a besoin de plus de gens comme toi, ${pushname} !`,
                `${pushname}, tu es une source d'inspiration !`,
                `Ta positivité est contagieuse, ${pushname} !`,
                `Merci d'être toi, ${pushname} !`
            ];
            
            const compliment = compliments[Math.floor(Math.random() * compliments.length)];
            reply(compliment);
        }
    },
    {
        pattern: "insult",
        react: "🤬",
        alias: ["roast"],
        desc: "Insulte humoristique",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned, quoted, sender, pushname }) {
            let target = sender;
            let name = pushname;
            
            if (mentioned && mentioned.length > 0) {
                target = mentioned[0];
                name = target.split('@')[0];
            } else if (quoted) {
                target = quoted.sender;
                name = target.split('@')[0];
            }
            
            const insults = [
                `${name}, si la bêtise était de l'électricité, tu serais une centrale nucléaire !`,
                `${name}, je ne t'insulterai pas. La nature s'en est déjà chargée.`,
                `${name}, ton QI est si bas qu'il pourrait servir de température de congélation.`,
                `Si l'ignorance est une bénédiction, ${name} doit être l'être le plus béni du monde.`,
                `${name}, tu es la preuve vivante que l'évolution peut faire marche arrière.`,
                `Ne t'inquiète pas ${name}, même un ordinateur a ses mauvais jours.`
            ];
            
            const insult = insults[Math.floor(Math.random() * insults.length)];
            reply(insult, { mentions: [target] });
        }
    },
    {
        pattern: "flirt",
        react: "😘",
        desc: "Message de flirt aléatoire",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned, quoted, sender, pushname }) {
            let target = sender;
            let name = pushname;
            
            if (mentioned && mentioned.length > 0) {
                target = mentioned[0];
                name = target.split('@')[0];
            } else if (quoted) {
                target = quoted.sender;
                name = target.split('@')[0];
            }
            
            const flirts = [
                `Si la beauté était du temps, ${name}, tu serais une éternité.`,
                `Es-tu un aimant ? Parce que je suis irrésistiblement attiré vers toi, ${name}.`,
                `Si j'étais un chat, je passerais mes 9 vies avec toi, ${name}.`,
                `${name}, tes yeux sont comme des étoiles... Je ne peux m'empêcher de me perdre dans leur constellation.`,
                `Si le sourire avait une valeur, le tien vaudrait plus que tout l'or du monde, ${name}.`,
                `Est-ce que tu as une carte ? Je me suis perdu dans tes yeux, ${name}.`
            ];
            
            const flirt = flirts[Math.floor(Math.random() * flirts.length)];
            reply(flirt, { mentions: [target] });
        }
    },
    {
        pattern: "shayari",
        react: "📜",
        desc: "Poésie romantique",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const shayaris = [
                `Tes yeux sont deux océans, dans lesquels je veux me noyer,
                Ton sourire est un soleil, qui illumine mes journées grises.`,
                
                `Si chaque feuille était un mot d'amour, chaque arbre serait une lettre pour toi,
                Si chaque goutte de pluie était un baiser, la tempête ne suffirait pas à t'exprimer mon amour.`,
                
                `Mon cœur est une bibliothèque, et chaque livre raconte ton histoire,
                Mon âme est une mélodie, qui ne chante que pour ta gloire.`,
                
                `Si l'amour est un crime, alors je suis coupable à vie,
                Si l'admiration est un péché, alors je suis damné pour l'éternité.`
            ];
            
            const shayari = shayaris[Math.floor(Math.random() * shayaris.length)];
            reply(`📜 Shayari:\n\n${shayari}`);
        }
    },
    {
        pattern: "goodnight",
        react: "🌙",
        alias: ["bonnenuit"],
        desc: "Souhaiter une bonne nuit",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const messages = [
                "🌙 Que les étoiles veillent sur tes rêves et que la lune berce ton sommeil. Bonne nuit !",
                "🌙 Ferme les yeux et laisse le sommeil t'emporter vers des rêves merveilleux. Bonne nuit !",
                "🌙 Que cette nuit t'apporte le repos dont tu as besoin pour réveiller une nouvelle énergie demain. Bonne nuit !",
                "🌙 Que les anges veillent sur ton sommeil et te protègent toute la nuit. Bonne nuit !"
            ];
            
            const message = messages[Math.floor(Math.random() * messages.length)];
            reply(message);
        }
    },
    {
        pattern: "roseday",
        react: "🌹",
        desc: "Générer une rose numérique",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned, quoted, sender }) {
            let target = sender;
            
            if (mentioned && mentioned.length > 0) {
                target = mentioned[0];
            } else if (quoted) {
                target = quoted.sender;
            }
            
            const roseImage = "https://i.ibb.co/0YqTzXJ/rose.jpg";
            
            await conn.sendMessage(
                m.chat,
                {
                    image: { url: roseImage },
                    caption: `🌹 Une rose pour @${target.split('@')[0]}`,
                    mentions: [target]
                },
                { quoted: mek }
            );
        }
    },
    {
        pattern: "character",
        react: "🦸",
        alias: ["createchar"],
        desc: "Créer un personnage aléatoire",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            const races = ["Humain", "Elfe", "Nain", "Orc", "Demi-dieu", "Robot", "Alien"];
            const classes = ["Guerrier", "Mage", "Archer", "Voleur", "Prêtre", "Ingénieur", "Psionique"];
            const traits = ["Brave", "Intelligent", "Rusé", "Loyal", "Charismatique", "Mystérieux", "Impulsif"];
            const abilities = ["Contrôle du feu", "Télépathie", "Invisibilité", "Super force", "Vol", "Guérison", "Téléportation"];
            
            const character = {
                name: `Personnage${Math.floor(Math.random() * 1000)}`,
                race: races[Math.floor(Math.random() * races.length)],
                class: classes[Math.floor(Math.random() * classes.length)],
                trait: traits[Math.floor(Math.random() * traits.length)],
                ability: abilities[Math.floor(Math.random() * abilities.length)],
                level: Math.floor(Math.random() * 100) + 1
            };
            
            const characterInfo = `🦸 *Personnage Créé* 🦸\n\n` +
                                `Nom: ${character.name}\n` +
                                `Race: ${character.race}\n` +
                                `Classe: ${character.class}\n` +
                                `Trait principal: ${character.trait}\n` +
                                `Capacité spéciale: ${character.ability}\n` +
                                `Niveau: ${character.level}`;
            
            reply(characterInfo);
        }
    },
    {
        pattern: "wasted",
        react: "💀",
        desc: "Effet GTA Wasted sur une photo de profil",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted, sender }) {
            try {
                let jid = sender;
                
                if (quoted) {
                    jid = quoted.sender;
                }
                
                const ppUrl = await conn.profilePictureUrl(jid, 'image');
                const imageBuffer = await getBuffer(ppUrl);
                
                // Appliquer l'effet Wasted (simulé ici)
                const wastedUrl = `https://some-edit-api.com/wasted?image=${encodeURIComponent(ppUrl)}`;
                const wastedBuffer = await getBuffer(wastedUrl);
                
                await conn.sendMessage(
                    m.chat,
                    { image: wastedBuffer },
                    { quoted: mek }
                );
                
            } catch (e) {
                console.error("Erreur wasted:", e);
                reply("❌ Impossible d'appliquer l'effet Wasted");
            }
        }
    },
    {
        pattern: "ship",
        react: "💘",
        alias: ["lovecalc"],
        desc: "Calculer la compatibilité amoureuse",
        category: "fun",
        filename: __filename,
        async handler(conn, mek, m, { reply, mentioned }) {
            if (!mentioned || mentioned.length < 2) {
                return reply("❌ Mentionnez deux personnes\nEx: .ship @user1 @user2");
            }
            
            const user1 = mentioned[0].split('@')[0];
            const user2 = mentioned[1].split('@')[0];
            const percentage = Math.floor(Math.random() * 101);
            
            let comment;
            if (percentage < 20) comment = "Pas du tout compatible 😬";
            else if (percentage < 40) comment = "Peu compatible 😕";
            else if (percentage < 60) comment = "Compatible modérément 😊";
            else if (percentage < 80) comment = "Très compatible 😍";
            else comment = "Compatibilité parfaite! 💖";
            
            const shipName = user1.substring(0, 3) + user2.substring(user2.length - 3);
            
            const shipMessage = `💘 *Test de Compatibilité*\n\n` +
                              `@${user1} ❤️ @${user2}\n\n` +
                              `Nom du couple: ${shipName}\n` +
                              `Compatibilité: ${percentage}%\n` +
                              `Verdict: ${comment}`;
            
            reply(shipMessage, { mentions: mentioned });
        }
    },
    {
 
