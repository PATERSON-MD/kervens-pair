const { lite } = require('../lite');
const config = require('../settings');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { getBuffer } = require('../utils');

// Dossier pour les images générées
const AI_IMAGES_DIR = path.join(__dirname, '../database/ai_images');
if (!fs.existsSync(AI_IMAGES_DIR)) {
    fs.mkdirSync(AI_IMAGES_DIR, { recursive: true });
}

// Historique de conversation pour GPT
const conversationHistory = new Map();

module.exports = [
    {
        pattern: "gpt",
        react: "💬",
        alias: ["ai", "ask"],
        desc: "Chat avec GPT-4",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, sender }) {
            if (!text) return reply("❌ Veuillez poser une question après la commande");
            
            try {
                const userHistory = conversationHistory.get(sender) || [];
                
                // Construire l'historique de conversation
                const messages = [
                    {
                        role: "system",
                        content: "Tu es PATERSON-MD, un assistant IA créé par Kervens Aubourg. Tu parles français et créole haïtien. Sois concis et utile."
                    },
                    ...userHistory.slice(-6), // Garder les 6 derniers messages
                    { role: "user", content: text }
                ];
                
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: "gpt-4-turbo",
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 1000
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${config.OPENAI_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const aiResponse = response.data.choices[0].message.content;
                
                // Mettre à jour l'historique
                userHistory.push(
                    { role: "user", content: text },
                    { role: "assistant", content: aiResponse }
                );
                conversationHistory.set(sender, userHistory);
                
                reply(`💬 GPT-4:\n\n${aiResponse}`);
            } catch (e) {
                console.error("Erreur GPT:", e.response?.data || e.message);
                reply("❌ Erreur de l'IA. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "gptgo",
        react: "🔍",
        desc: "GPT avec recherche en temps réel",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez entrer votre requête");
            
            try {
                const searchResponse = await axios.get(
                    `https://api.search.ai/search?query=${encodeURIComponent(text)}`,
                    {
                        headers: { 'Authorization': `Bearer ${config.SEARCH_API_KEY}` }
                    }
                );
                
                const searchData = searchResponse.data.results.slice(0, 3);
                let context = "Contexte de recherche:\n";
                
                searchData.forEach((result, i) => {
                    context += `\n${i+1}. [${result.title}](${result.url})\n${result.snippet}\n`;
                });
                
                const prompt = `${context}\n\nEn utilisant les informations ci-dessus, réponds à cette question : ${text}`;
                
                const gptResponse = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: "gpt-4-turbo",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.5,
                        max_tokens: 1500
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${config.OPENAI_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const aiResponse = gptResponse.data.choices[0].message.content;
                
                let finalResponse = `🔍 *Réponse avec recherche* 🔍\n\n${aiResponse}\n\n📚 Sources:\n`;
                searchData.forEach((result, i) => {
                    finalResponse += `\n${i+1}. [${result.title}](${result.url})`;
                });
                
                reply(finalResponse);
            } catch (e) {
                console.error("Erreur GPT-GO:", e.response?.data || e.message);
                reply("❌ Erreur de recherche. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "gemini",
        react: "🤖",
        desc: "Google Gemini Pro",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez entrer votre requête");
            
            try {
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.GEMINI_KEY}`,
                    {
                        contents: [{
                            parts: [{
                                text: `Tu es PATERSON-MD, un assistant IA créé pour la communauté haïtienne. Réponds en français/créole. Question: ${text}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1000
                        }
                    }
                );
                
                const aiResponse = response.data.candidates[0].content.parts[0].text;
                reply(`🤖 Gemini:\n\n${aiResponse}`);
            } catch (e) {
                console.error("Erreur Gemini:", e.response?.data || e.message);
                reply("❌ Erreur de Gemini. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "imagine",
        react: "🎨",
        alias: ["genimage", "dalle"],
        desc: "Générer une image avec IA",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez décrire l'image à générer");
            
            try {
                reply("🖌️ Création de votre image...");
                
                const response = await axios.post(
                    'https://api.openai.com/v1/images/generations',
                    {
                        model: "dall-e-3",
                        prompt: text,
                        n: 1,
                        size: "1024x1024",
                        quality: "hd",
                        style: "vivid"
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${config.OPENAI_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const imageUrl = response.data.data[0].url;
                const revisedPrompt = response.data.data[0].revised_prompt;
                
                const imageBuffer = await getBuffer(imageUrl);
                const filename = `ai_image_${Date.now()}.png`;
                const filePath = path.join(AI_IMAGES_DIR, filename);
                fs.writeFileSync(filePath, imageBuffer);
                
                await conn.sendMessage(
                    m.chat,
                    {
                        image: imageBuffer,
                        caption: `🎨 *${text}*\n\n${revisedPrompt}`
                    },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur DALL-E:", e.response?.data || e.message);
                reply("❌ Erreur de génération d'image. Votre prompt peut contenir du contenu bloqué.");
            }
        }
    },
    {
        pattern: "flux",
        react: "🌀",
        desc: "Assistant IA avancé Flux",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, sender }) {
            if (!text) return reply("❌ Veuillez entrer votre requête");
            
            try {
                const response = await axios.post(
                    'https://api.fluxai.io/v1/chat',
                    {
                        model: "flux-ultra",
                        messages: [
                            {
                                role: "system",
                                content: "Tu es PATERSON-MD, un assistant IA spécialisé pour Haïti. Utilise un mélange de français et de créole haïtien. Sois précis et utile."
                            },
                            {
                                role: "user",
                                content: text
                            }
                        ],
                        temperature: 0.6
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${config.FLUX_API_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const aiResponse = response.data.choices[0].message.content;
                reply(`🌀 Flux AI:\n\n${aiResponse}`);
            } catch (e) {
                console.error("Erreur Flux:", e.response?.data || e.message);
                reply("❌ Erreur de l'assistant Flux. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "aimode",
        react: "🤖",
        desc: "Activer/désactiver le mode conversation IA",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, sender }) {
            config.AI_MODE = config.AI_MODE || new Set();
            
            if (config.AI_MODE.has(sender)) {
                config.AI_MODE.delete(sender);
                reply("✅ Mode IA désactivé. Je ne répondrai plus automatiquement à vos messages.");
            } else {
                config.AI_MODE.add(sender);
                reply("🤖 Mode IA activé! Je répondrai à tous vos messages comme un assistant IA. Utilisez .aimode pour désactiver.");
            }
        }
    },
    {
        pattern: "resetai",
        react: "🔄",
        desc: "Réinitialiser la conversation IA",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, sender }) {
            conversationHistory.delete(sender);
            reply("🔄 Historique de conversation IA réinitialisé. La conversation recommence à zéro.");
        }
    },
    {
        pattern: "tts",
        react: "🗣️",
        desc: "Convertir du texte en parole",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, args }) {
            if (!text) return reply("❌ Veuillez entrer le texte à convertir");
            
            try {
                const voice = args[1] || "onyx"; // Voix par défaut
                const voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
                
                if (!voices.includes(voice)) {
                    return reply(`❌ Voix invalide. Options: ${voices.join(', ')}`);
                }
                
                const response = await axios.post(
                    'https://api.openai.com/v1/audio/speech',
                    {
                        model: "tts-1-hd",
                        input: text,
                        voice: voice
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${config.OPENAI_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        responseType: 'arraybuffer'
                    }
                );
                
                const audioBuffer = Buffer.from(response.data);
                const tmpPath = path.join(AI_IMAGES_DIR, `tts_${Date.now()}.mp3`);
                fs.writeFileSync(tmpPath, audioBuffer);
                
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: fs.readFileSync(tmpPath),
                        mimetype: 'audio/mpeg',
                        fileName: 'message_tts.mp3'
                    },
                    { quoted: mek }
                );
                
                fs.unlinkSync(tmpPath);
            } catch (e) {
                console.error("Erreur TTS:", e.response?.data || e.message);
                reply("❌ Erreur de synthèse vocale. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "stt",
        react: "📝",
        desc: "Convertir un message vocal en texte",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted }) {
            if (!quoted || !quoted.message.audioMessage) {
                return reply("❌ Répondez à un message vocal");
            }
            
            try {
                const audioBuffer = await conn.downloadMediaMessage(quoted);
                const tmpPath = path.join(AI_IMAGES_DIR, `stt_${Date.now()}.ogg`);
                fs.writeFileSync(tmpPath, audioBuffer);
                
                // Convertir en MP3 si nécessaire
                const mp3Path = path.join(AI_IMAGES_DIR, `stt_${Date.now()}.mp3`);
                await new Promise((resolve, reject) => {
                    ffmpeg(tmpPath)
                        .toFormat('mp3')
                        .save(mp3Path)
                        .on('end', resolve)
                        .on('error', reject);
                });
                
                const audioFile = fs.createReadStream(mp3Path);
                const form = new FormData();
                form.append('file', audioFile, 'audio.mp3');
                form.append('model', 'whisper-1');
                
                const response = await axios.post(
                    'https://api.openai.com/v1/audio/transcriptions',
                    form,
                    {
                        headers: {
                            'Authorization': `Bearer ${config.OPENAI_KEY}`,
                            ...form.getHeaders()
                        }
                    }
                );
                
                const transcription = response.data.text;
                reply(`📝 Transcription:\n\n${transcription}`);
                
                // Nettoyer les fichiers temporaires
                fs.unlinkSync(tmpPath);
                fs.unlinkSync(mp3Path);
            } catch (e) {
                console.error("Erreur STT:", e.response?.data || e.message);
                reply("❌ Erreur de reconnaissance vocale. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "vision",
        react: "👁️",
        desc: "Décrire une image avec IA",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted, text }) {
            if (!quoted || !quoted.message.imageMessage) {
                return reply("❌ Répondez à une image");
            }
            
            try {
                const prompt = text || "Que vois-tu sur cette image? Décris en détail.";
                const imageBuffer = await conn.downloadMediaMessage(quoted);
                const base64Image = imageBuffer.toString('base64');
                
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: "gpt-4-vision-preview",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: prompt },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:image/jpeg;base64,${base64Image}`
                                        }
                                    }
                                ]
                            }
                        ],
                        max_tokens: 1000
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${config.OPENAI_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const aiResponse = response.data.choices[0].message.content;
                reply(`👁️ Vision IA:\n\n${aiResponse}`);
            } catch (e) {
                console.error("Erreur Vision:", e.response?.data || e.message);
                reply("❌ Erreur d'analyse d'image. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "haiai",
        react: "🇭🇹",
        desc: "Assistant IA spécialisé sur Haïti",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez poser votre question sur Haïti");
            
            try {
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    {
                        model: "gpt-4-turbo",
                        messages: [
                            {
                                role: "system",
                                content: `Tu es un expert sur Haïti. Tu connais la culture, l'histoire, la géographie et l'actualité haïtienne. 
                                Réponds en créole haïtien ou en français selon la préférence de l'utilisateur. 
                                Date actuelle: ${new Date().toLocaleDateString()}.`
                            },
                            {
                                role: "user",
                                content: text
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${config.OPENAI_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                const aiResponse = response.data.choices[0].message.content;
                reply(`🇭🇹 Assistant Haïti:\n\n${aiResponse}`);
            } catch (e) {
                console.error("Erreur Haiti AI:", e.response?.data || e.message);
                reply("❌ Erreur de l'assistant Haïti. Veuillez réessayer.");
            }
        }
    },
    {
        pattern: "docai",
        react: "📄",
        desc: "Analyser un document avec IA",
        category: "ai",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted, text }) {
            if (!quoted || !quoted.message.documentMessage) {
                return reply("❌ Répondez à un document (PDF, DOCX, TXT)");
            }
     
