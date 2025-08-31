const { lite } = require('../lite');
const config = require('../settings');
const ytdl = require('ytdl-core');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { getBuffer } = require('../utils');
const FormData = require('form-data');

// Créer le dossier tmp s'il n'existe pas
const TMP_DIR = path.join(__dirname, '../tmp');
if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
}

module.exports = [
    {
        pattern: "play",
        react: "🎵",
        desc: "Rechercher et jouer de la musique depuis YouTube",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un titre de musique");
            
            try {
                reply("🔍 Recherche de la musique...");
                
                // Recherche YouTube
                const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(text)}`;
                const { data } = await axios.get(searchUrl);
                
                // Extraire le premier résultat
                const videoIdMatch = data.match(/"videoId":"([^"]+)"/);
                if (!videoIdMatch) return reply("❌ Aucun résultat trouvé");
                
                const videoId = videoIdMatch[1];
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                const videoInfo = await ytdl.getInfo(videoUrl);
                const title = videoInfo.videoDetails.title;
                const duration = parseInt(videoInfo.videoDetails.lengthSeconds);
                
                if (duration > 600) 
                    return reply("❌ Les musiques de plus de 10 minutes ne sont pas supportées");
                
                reply(`⬇️ Téléchargement: ${title}...`);
                
                const tmpPath = path.join(TMP_DIR, `${Date.now()}_${title}.mp3`);
                const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
                
                await new Promise((resolve, reject) => {
                    ffmpeg(stream)
                        .audioBitrate(320)
                        .save(tmpPath)
                        .on('end', resolve)
                        .on('error', reject);
                });
                
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: fs.readFileSync(tmpPath),
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`,
                        contextInfo: {
                            externalAdReply: {
                                title: `🎵 ${title}`,
                                body: `Durée: ${Math.floor(duration/60)}:${duration%60 < 10 ? '0' : ''}${duration%60}`,
                                thumbnail: await getBuffer(videoInfo.videoDetails.thumbnails[0].url)
                            }
                        }
                    },
                    { quoted: mek }
                );
                
                fs.unlinkSync(tmpPath);
            } catch (e) {
                console.error("Erreur play:", e);
                reply("❌ Échec de la recherche ou du téléchargement.");
            }
        }
    },
    {
        pattern: "ytmp3",
        react: "🎵",
        desc: "Télécharger un audio YouTube",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien YouTube");
            
            try {
                const videoUrl = text.trim();
                const videoInfo = await ytdl.getInfo(videoUrl);
                const title = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
                const duration = parseInt(videoInfo.videoDetails.lengthSeconds);
                
                if (duration > 600) 
                    return reply("❌ Les vidéos de plus de 10 minutes ne sont pas supportées");
                
                reply(`⬇️ Téléchargement: ${title}...`);
                
                const tmpPath = path.join(TMP_DIR, `${Date.now()}_${title}.mp3`);
                const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
                
                await new Promise((resolve, reject) => {
                    ffmpeg(stream)
                        .audioBitrate(320)
                        .save(tmpPath)
                        .on('end', resolve)
                        .on('error', reject);
                });
                
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: fs.readFileSync(tmpPath),
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`,
                        contextInfo: {
                            externalAdReply: {
                                title: `🎵 ${title}`,
                                body: `Durée: ${Math.floor(duration/60)}:${duration%60 < 10 ? '0' : ''}${duration%60}`,
                                thumbnail: await getBuffer(videoInfo.videoDetails.thumbnails[0].url)
                            }
                        }
                    },
                    { quoted: mek }
                );
                
                fs.unlinkSync(tmpPath);
            } catch (e) {
                console.error("Erreur ytmp3:", e);
                reply("❌ Échec du téléchargement. Lien invalide ou vidéo trop longue.");
            }
        }
    },
    {
        pattern: "ytmp4",
        react: "🎬",
        desc: "Télécharger une vidéo YouTube",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien YouTube");
            
            try {
                const videoUrl = text.trim();
                const videoInfo = await ytdl.getInfo(videoUrl);
                const title = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
                const duration = parseInt(videoInfo.videoDetails.lengthSeconds);
                
                if (duration > 300) 
                    return reply("❌ Les vidéos de plus de 5 minutes ne sont pas supportées");
                
                reply(`⬇️ Téléchargement: ${title}...`);
                
                const tmpPath = path.join(TMP_DIR, `${Date.now()}_${title}.mp4`);
                const stream = ytdl(videoUrl, { quality: 'highest' });
                
                stream.pipe(fs.createWriteStream(tmpPath));
                
                await new Promise((resolve) => stream.on('end', resolve));
                
                await conn.sendMessage(
                    m.chat,
                    {
                        video: fs.readFileSync(tmpPath),
                        caption: `🎬 *${title}*\nDurée: ${Math.floor(duration/60)}:${duration%60 < 10 ? '0' : ''}${duration%60}`,
                        fileName: `${title}.mp4`,
                        gifPlayback: false
                    },
                    { quoted: mek }
                );
                
                fs.unlinkSync(tmpPath);
            } catch (e) {
                console.error("Erreur ytmp4:", e);
                reply("❌ Échec du téléchargement. Lien invalide ou vidéo trop longue.");
            }
        }
    },
    {
        pattern: "igdl",
        react: "📸",
        desc: "Télécharger depuis Instagram",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien Instagram");
            
            try {
                reply("🔍 Récupération du contenu Instagram...");
                
                const apiUrl = `https://api.nekosapi.com/instagram?url=${encodeURIComponent(text)}`;
                const { data } = await axios.get(apiUrl);
                
                if (!data.media || data.media.length === 0) 
                    return reply("❌ Aucun média trouvé");
                
                const media = data.media[0];
                
                if (media.type === 'image') {
                    await conn.sendMessage(
                        m.chat,
                        {
                            image: await getBuffer(media.url),
                            caption: `📸 Instagram\n${data.caption || ''}`
                        },
                        { quoted: mek }
                    );
                } else if (media.type === 'video') {
                    await conn.sendMessage(
                        m.chat,
                        {
                            video: await getBuffer(media.url),
                            caption: `🎥 Instagram Video\n${data.caption || ''}`
                        },
                        { quoted: mek }
                    );
                } else if (media.type === 'carousel') {
                    const mediaBuffers = await Promise.all(
                        data.media.map(item => getBuffer(item.url))
                    );
                    
                    await conn.sendMessage(
                        m.chat,
                        {
                            image: mediaBuffers[0],
                            caption: `📸 Instagram Carousel (${data.media.length} images)`,
                            contextInfo: {
                                mentionedJid: [m.sender]
                            }
                        },
                        { quoted: mek }
                    );
                    
                    // Envoyer les images restantes
                    for (let i = 1; i < mediaBuffers.length; i++) {
                        await conn.sendMessage(
                            m.chat,
                            { image: mediaBuffers[i] },
                            { quoted: mek }
                        );
                    }
                }
            } catch (e) {
                console.error("Erreur igdl:", e);
                reply("❌ Échec du téléchargement. Lien invalide ou problème d'API.");
            }
        }
    },
    {
        pattern: "tiktok",
        react: "📱",
        desc: "Télécharger une vidéo TikTok",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien TikTok");
            
            try {
                reply("⬇️ Téléchargement TikTok...");
                
                const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(text)}`;
                const { data } = await axios.get(apiUrl);
                
                if (!data.video) 
                    return reply("❌ Échec de la récupération du contenu TikTok");
                
                const videoBuffer = await getBuffer(data.video);
                
                await conn.sendMessage(
                    m.chat,
                    {
                        video: videoBuffer,
                        caption: `📱 TikTok - ${data.author?.nickname || 'Unknown'}\n${data.title || ''}`,
                        gifPlayback: false
                    },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur tiktok:", e);
                reply("❌ Échec du téléchargement. Lien invalide ou problème d'API.");
            }
        }
    },
    {
        pattern: "spotify",
        react: "🎧",
        desc: "Télécharger de la musique depuis Spotify",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien Spotify ou un nom de musique");
            
            try {
                reply("🔍 Recherche sur Spotify...");
                
                // Utiliser une API tierce pour Spotify
                const { data } = await axios.get(
                    `https://api.spotify-downloader.com/?url=${encodeURIComponent(text)}`
                );
                
                if (!data.success) return reply("❌ Échec de la recherche Spotify");
                
                const title = data.title;
                const artist = data.artist;
                
                reply(`⬇️ Téléchargement: ${title} - ${artist}...`);
                
                const audioBuffer = await getBuffer(data.download_url);
                
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`,
                        contextInfo: {
                            externalAdReply: {
                                title: `🎧 ${title}`,
                                body: artist,
                                thumbnail: await getBuffer(data.thumbnail)
                            }
                        }
                    },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur spotify:", e);
                reply("❌ Échec du téléchargement. Vérifiez le lien ou essayez plus tard.");
            }
        }
    },
    {
        pattern: "fbdl",
        react: "📹",
        desc: "Télécharger depuis Facebook",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien Facebook");
            
            try {
                reply("⬇️ Téléchargement Facebook...");
                
                const apiUrl = `https://fbdown.net/api/apiServer.php?url=${encodeURIComponent(text)}`;
                const { data } = await axios.get(apiUrl);
                
                if (!data.links || data.links.length === 0) 
                    return reply("❌ Aucun média trouvé");
                
                const videoUrl = data.links[0].url;
                const videoBuffer = await getBuffer(videoUrl);
                
                await conn.sendMessage(
                    m.chat,
                    {
                        video: videoBuffer,
                        caption: `📹 Facebook Video\n${data.title || ''}`,
                        gifPlayback: false
                    },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur fbdl:", e);
                reply("❌ Échec du téléchargement. Lien invalide ou vidéo privée.");
            }
        }
    },
    {
        pattern: "twitter",
        react: "🐦",
        desc: "Télécharger depuis Twitter/X",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien Twitter");
            
            try {
                reply("⬇️ Téléchargement Twitter...");
                
                const apiUrl = `https://twitsave.com/info?url=${encodeURIComponent(text)}`;
                const { data } = await axios.get(apiUrl);
                
                if (!data.media) return reply("❌ Aucun média trouvé");
                
                const mediaUrl = data.media[0].url;
                const mediaBuffer = await getBuffer(mediaUrl);
                
                if (data.media[0].type === 'video') {
                    await conn.sendMessage(
                        m.chat,
                        {
                            video: mediaBuffer,
                            caption: `🐦 Twitter Video\n${data.text || ''}`,
                            gifPlayback: false
                        },
                        { quoted: mek }
                    );
                } else {
                    await conn.sendMessage(
                        m.chat,
                        {
                            image: mediaBuffer,
                            caption: `🐦 Twitter Image\n${data.text || ''}`
                        },
                        { quoted: mek }
                    );
                }
            } catch (e) {
                console.error("Erreur twitter:", e);
                reply("❌ Échec du téléchargement. Lien invalide ou tweet protégé.");
            }
        }
    },
    {
        pattern: "geturl",
        react: "🔗",
        desc: "Obtenir l'URL d'un média",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, quoted }) {
            if (!quoted) return reply("❌ Répondez à un média");
            
            try {
                const messageType = Object.keys(quoted.message)[0];
                let mediaType;
                
                switch (messageType) {
                    case 'imageMessage':
                        mediaType = 'image';
                        break;
                    case 'videoMessage':
                        mediaType = 'video';
                        break;
                    case 'audioMessage':
                        mediaType = 'audio';
                        break;
                    case 'documentMessage':
                        mediaType = 'document';
                        break;
                    default:
                        return reply("❌ Type de média non supporté");
                }
                
                reply("⬆️ Téléversement du média...");
                
                const buffer = await conn.downloadMediaMessage(quoted);
                
                // Utiliser un service d'hébergement temporaire
                const form = new FormData();
                form.append('file', buffer, `media.${mediaType === 'image' ? 'jpg' : mediaType === 'audio' ? 'mp3' : 'mp4'}`);
                
                const { data } = await axios.post('https://file.io', form, {
                    headers: form.getHeaders()
                });
                
                if (data.success) {
                    reply(`🔗 URL ${mediaType.toUpperCase()}:\n${data.link}\n\n⚠️ Expire après 14 jours`);
                } else {
                    reply('❌ Échec du téléversement du média');
                }
            } catch (e) {
                console.error("Erreur geturl:", e);
                reply(`❌ Erreur: ${e.message}`);
            }
        }
    },
    {
        pattern: "shorturl",
        react: "🔗",
        desc: "Raccourcir un URL",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un URL");
            
            try {
                reply("🔗 Raccourcissement de l'URL...");
                
                const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
                
                reply(`🔗 URL raccourci:\n${data}`);
            } catch (e) {
                console.error("Erreur shorturl:", e);
                reply("❌ Échec du raccourcissement de l'URL");
            }
        }
    }
];
