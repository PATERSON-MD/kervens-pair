const { lite } = require('../lite');
const config = require('../settings');
const ytdl = require('ytdl-core');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { getBuffer } = require('../utils');

// Créer le dossier tmp s'il n'existe pas
const TMP_DIR = path.join(__dirname, '../tmp');
if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
}

module.exports = [
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
                                body: `Téléchargé par ${m.pushname}`,
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
                
                if (duration > 600) 
                    return reply("❌ Les vidéos de plus de 10 minutes ne sont pas supportées");
                
                reply(`⬇️ Téléchargement: ${title}...`);
                
                const tmpPath = path.join(TMP_DIR, `${Date.now()}_${title}.mp4`);
                const stream = ytdl(videoUrl, { quality: 'highest' });
                
                stream.pipe(fs.createWriteStream(tmpPath));
                
                await new Promise((resolve) => stream.on('end', resolve));
                
                await conn.sendMessage(
                    m.chat,
                    {
                        video: fs.readFileSync(tmpPath),
                        caption: `🎬 *${title}*\nDurée: ${Math.floor(duration/60)}:${duration%60}`,
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
        react: "🎵",
        desc: "Télécharger une vidéo TikTok",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien TikTok");
            
            try {
                reply("⬇️ Téléchargement TikTok...");
                
                const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(text)}`;
                const { data } = await axios.get(apiUrl);
                
                if (!data.video || !data.music) 
                    return reply("❌ Échec de la récupération du contenu TikTok");
                
                // Télécharger la vidéo
                const videoBuffer = await getBuffer(data.video);
                
                // Télécharger l'audio
                const audioBuffer = await getBuffer(data.music);
                
                // Envoyer la vidéo avec audio intégré
                await conn.sendMessage(
                    m.chat,
                    {
                        video: videoBuffer,
                        caption: `🎵 TikTok - ${data.author.nickname}\n${data.title}`,
                        gifPlayback: false
                    },
                    { quoted: mek }
                );
                
                // Envoyer l'audio séparément
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: 'audio_tiktok.mp3'
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
                
                // Recherche ou traitement du lien
                const isUrl = text.includes('spotify.com');
                let songData;
                
                if (isUrl) {
                    // Extraction depuis un lien
                    const trackId = text.split('/track/')[1]?.split('?')[0];
                    if (!trackId) return reply("❌ Lien Spotify invalide");
                    
                    const { data } = await axios.get(
                        `https://api.spotify.com/v1/tracks/${trackId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${config.SPOTIFY_TOKEN}`
                            }
                        }
                    );
                    songData = data;
                } else {
                    // Recherche par texte
                    const { data } = await axios.get(
                        `https://api.spotify.com/v1/search?q=${encodeURIComponent(text)}&type=track&limit=1`,
                        {
                            headers: {
                                'Authorization': `Bearer ${config.SPOTIFY_TOKEN}`
                            }
                        }
                    );
                    songData = data.tracks.items[0];
                    if (!songData) return reply("❌ Aucun résultat trouvé");
                }
                
                const title = songData.name;
                const artist = songData.artists.map(a => a.name).join(', ');
                const album = songData.album.name;
                const duration = Math.floor(songData.duration_ms / 1000);
                
                reply(`⬇️ Téléchargement: ${title} - ${artist}...`);
                
                // Recherche sur YouTube
                const ytSearch = await axios.get(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(`${title} ${artist}`)}&key=${config.YOUTUBE_API_KEY}&maxResults=1`
                );
                
                const videoId = ytSearch.data.items[0]?.id.videoId;
                if (!videoId) return reply("❌ Vidéo YouTube non trouvée");
                
                // Téléchargement depuis YouTube
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                const videoInfo = await ytdl.getInfo(videoUrl);
                
                const tmpPath = path.join(TMP_DIR, `${Date.now()}_${title}.mp3`);
                const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
                
                await new Promise((resolve, reject) => {
                    ffmpeg(stream)
                        .audioBitrate(320)
                        .save(tmpPath)
                        .on('end', resolve)
                        .on('error', reject);
                });
                
                // Ajouter les métadonnées
                const coverBuffer = await getBuffer(songData.album.images[0].url);
                
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: fs.readFileSync(tmpPath),
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`,
                        contextInfo: {
                            externalAdReply: {
                                title: `🎧 ${title}`,
                                body: `${artist} | ${album}`,
                                thumbnail: coverBuffer
                            }
                        }
                    },
                    { quoted: mek }
                );
                
                fs.unlinkSync(tmpPath);
            } catch (e) {
                console.error("Erreur spotify:", e);
                reply("❌ Échec du téléchargement. Vérifiez le token Spotify ou la connexion API.");
            }
        }
    },
    {
        pattern: "imgsrc",
        react: "🖼️",
        desc: "Télécharger une image depuis un lien",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien d'image");
            
            try {
                reply("⬇️ Téléchargement de l'image...");
                
                const imageBuffer = await getBuffer(text);
                
                await conn.sendMessage(
                    m.chat,
                    { image: imageBuffer },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur imgsrc:", e);
                reply("❌ Échec du téléchargement. Lien invalide ou image trop lourde.");
            }
        }
    },
    {
        pattern: "mediafire",
        react: "📦",
        desc: "Télécharger depuis MediaFire",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien MediaFire");
            
            try {
                reply("🔍 Traitement du lien MediaFire...");
                
                const { data } = await axios.get(
                    `https://api.mediafire.com/v1.0/file/link?quickkey=${text.split('/')[4]}`,
                    { headers: { 'Authorization': `Bearer ${config.MEDIAFIRE_TOKEN}` } }
                );
                
                if (!data.response.file_info || !data.response.file_info.download_url) 
                    return reply("❌ Fichier non trouvé");
                
                const fileUrl = data.response.file_info.download_url;
                const fileName = data.response.file_info.filename;
                const fileSize = data.response.file_info.size;
                
                if (fileSize > 50 * 1024 * 1024) // 50MB
                    return reply(`❌ Fichier trop volumineux (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
                
                reply(`⬇️ Téléchargement: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)...`);
                
                const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                const fileBuffer = Buffer.from(response.data);
                
                await conn.sendMessage(
                    m.chat,
                    {
                        document: fileBuffer,
                        fileName: fileName,
                        mimetype: response.headers['content-type']
                    },
                    { quoted: mek }
                );
            } catch (e) {
                console.error("Erreur mediafire:", e);
                reply("❌ Échec du téléchargement. Lien invalide ou problème d'API.");
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
                
                const media = quoted.message[messageType];
                const buffer = await conn.downloadMediaMessage(quoted);
                
                const form = new FormData();
                form.append('file', buffer, `media.${mediaType === 'image' ? 'jpg' : mediaType === 'audio' ? 'mp3' : 'mp4'}`);
                
                const { data } = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
                    headers: form.getHeaders()
                });
                
                if (data.data && data.data.url) {
                    const directUrl = data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                    reply(`🔗 URL ${mediaType.toUpperCase()}:\n${directUrl}\n\n⚠️ Expire après 3 jours`);
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
        pattern: "scloud",
        react: "☁️",
        desc: "Télécharger depuis SoundCloud",
        category: "download",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            if (!text) return reply("❌ Veuillez fournir un lien SoundCloud");
            
            try {
                reply("🔍 Recherche sur SoundCloud...");
                
                const { data } = await axios.get(
                    `https://api.soundcloud.com/resolve?url=${encodeURIComponent(text)}&client_id=${config.SOUNDCLOUD_CLIENT_ID}`
                );
                
                if (!data.stream_url) return reply("❌ Piste non trouvée");
                
                const title = data.title;
                const artist = data.user.username;
                const duration = Math.floor(data.duration / 1000);
                
                reply(`⬇️ Téléchargement: ${title} - ${artist}...`);
                
                const streamUrl = `${data.stream_url}?client_id=${config.SOUNDCLOUD_CLIENT_ID}`;
                const audioBuffer = await getBuffer(streamUrl);
                
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`,
                        contextInfo:
