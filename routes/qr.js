const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    
    async function PATERSON_MD_PAIR_CODE() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            var items = ["Safari"];
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomItem = selectRandomItem(items);
            
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });
            
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
                if (qr) {
                    try {
                        const qrBuffer = await QRCode.toBuffer(qr);
                        res.setHeader('Content-Type', 'image/png');
                        res.end(qrBuffer);
                    } catch (e) {
                        console.error("QR generation error:", e);
                        res.status(500).send("QR generation failed");
                    }
                }
                
                if (connection === "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    
                    function generateRandomText() {
                        const prefix = "PAT";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let randomText = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            randomText += characters.charAt(randomIndex);
                        }
                        return randomText;
                    }
                    
                    const randomText = generateRandomText();
                    
                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "paterson~" + string_session;
                        
                        let code = await sock.sendMessage(sock.user.id, { text: md });
                        
                        let desc = `*Hey there, PATERSON-MD User!* 👋🏻

Thanks for using *PATERSON-MD* — your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————

*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20

*💻 Source Code:*  
Fork & explore the project on GitHub:  
https://github.com/PATERSON-MD/PATERSON-MD

——————

> *© Powered by Kervens Aubourg*
Stay cool and hack smart. ✌🏻`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴘᴀᴛᴇʀsᴏɴ-ᴍᴅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖙𝖊𝖉",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }  
                            }
                        }, { quoted: code });
                        
                    } catch (e) {
                        console.error("Session creation error:", e);
                        let ddd = await sock.sendMessage(sock.user.id, { text: e.toString() });
                        
                        let errorDesc = `*Hey there, PATERSON-MD User!* 👋🏻

Thanks for using *PATERSON-MD* — your session has been created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————

*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20

*💻 Source Code:*  
Fork & explore the project on GitHub:  
https://github.com/PATERSON-MD/PATERSON-MD

> *© Powered by Kervens Aubourg*
Stay cool and hack smart. ✌🏻`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: errorDesc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴘᴀᴛᴇʀsᴏɴ-ᴍᴅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖙𝖊𝖉 ✅",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }  
                            }
                        }, { quoted: ddd });
                    }
                    
                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    
    async function PATERSON_MD_PAIR_CODE() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            var items = ["Safari"];
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomItem = selectRandomItem(items);
            
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });
            
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
                if (qr) {
                    try {
                        const qrDataURL = await QRCode.toDataURL(qr);
                        res.json({ qr: qrDataURL }); // Envoie le QR en base64
                    } catch (e) {
                        console.error("QR generation error:", e);
                        if (!res.headersSent) {
                            res.status(500).json({ error: "QR generation failed" });
                        }
                    }
                }
                
                if (connection === "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    
                    function generateRandomText() {
                        const prefix = "PAT";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let randomText = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            randomText += characters.charAt(randomIndex);
                        }
                        return randomText;
                    }
                    
                    const randomText = generateRandomText();
                    
                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "paterson~" + string_session;
                        
                        let code = await sock.sendMessage(sock.user.id, { text: md });
                        
                        let desc = `*Hey there, PATERSON-MD User!* 👋🏻

Thanks for using *PATERSON-MD* — your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————

*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20

*💻 Source Code:*  
Fork & explore the project on GitHub:  
https://github.com/PATERSON-MD/PATERSON-MD

——————

> *© Powered by Kervens Aubourg*
Stay cool and hack smart. ✌🏻`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴘᴀᴛᴇʀsᴏɴ-ᴍᴅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖙𝖊𝖉",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }  
                            }
                        }, { quoted: code });
                        
                    } catch (e) {
                        console.error("Session creation error:", e);
                        let ddd = await sock.sendMessage(sock.user.id, { text: e.toString() });
                        
                        let errorDesc = `*Hey there, PATERSON-MD User!* 👋🏻

Thanks for using *PATERSON-MD* — your session has been created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————

*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20

*💻 Source Code:*  
Fork & explore the project on GitHub:  
https://github.com/PATERSON-MD/PATERSON-MD

> *© Powered by Kervens Aubourg*
Stay cool and hack smart. ✌🏻`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: errorDesc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴘᴀᴛᴇʀsᴏɴ-ᴍᴅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖙𝖊𝖉 ✅",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }  
                            }
                        }, { quoted: ddd });
                    }
                    
                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
                    await delay(10);
const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers
} = require("@whiskeysockets/baileys");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let responseSent = false; // Flag pour suivre l'état de la réponse
    
    async function PATERSON_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });
            
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
                // Gestion QR
                if (qr && !responseSent) {
                    try {
                        const qrBuffer = await QRCode.toBuffer(qr);
                        responseSent = true;
                        res.setHeader('Content-Type', 'image/png');
                        res.end(qrBuffer);
                    } catch (e) {
                        console.error("QR generation error:", e);
                        if (!responseSent) {
                            responseSent = true;
                            res.status(500).send("QR generation failed");
                        }
                    }
                }
                
                // Connexion réussie
                if (connection === "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    
                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "paterson~" + string_session;
                        
                        let code = await sock.sendMessage(sock.user.id, { text: md });
                        
                        let desc = `*Hey there, PATERSON-MD User!* 👋🏻

Thanks for using *PATERSON-MD* — your session has been successfully created!

🔐 *Session ID:* Sent above  
⚠️ *Keep it safe!* Do NOT share this ID with anyone.

——————

*✅ Stay Updated:*  
Join our official WhatsApp Channel:  
https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20

*💻 Source Code:*  
Fork & explore the project on GitHub:  
https://github.com/PATERSON-MD/PATERSON-MD

——————

> *© Powered by Kervens Aubourg*
Stay cool and hack smart. ✌🏻`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴘᴀᴛᴇʀsᴏɴ-ᴍᴅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖙𝖊𝖉",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }  
                            }
                        }, { quoted: code });
                        
                    } catch (e) {
                        console.error("Session creation error:", e);
                        let ddd = await sock.sendMessage(sock.user.id, { text: e.toString() });
                        
                        let errorDesc = `*Hey there, PATERSON-MD User!* 👋🏻

An error occurred during session creation:

❌ ${e.message}

——————

*Need help?*  
Contact support: paterson@support.com

> *© Powered by Kervens Aubourg*`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: errorDesc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "ᴘᴀᴛᴇʀsᴏɴ-ᴍᴅ Error",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 2,
                                    renderLargerThumbnail: true
                                }  
                            }
                        }, { quoted: ddd });
                    }
                    
                    await delay(100);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} Connected ✅`);
                    
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log("Connection closed unexpectedly");
                }
            });
        } catch (err) {
            console.error("Service error:", err);
            await removeFile('./temp/' + id);
            if (!responseSent) {
                responseSent = true;
                res.status(500).send("Service error");
            }
        }
    }
    
    await PATERSON_MD_PAIR_CODE();
});

module.exports = router;
