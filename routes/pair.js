import { makeid } from '../gen-id.js';
import express from 'express';
import fs from 'fs';
import pino from 'pino';
import { 
  default as makeWASocket,
  useMultiFileAuthState,
  delay,
  Browsers,
  makeCacheableSignalKeyStore,
  DisconnectReason
} from '@whiskeysockets/baileys';
import { upload } from '../mega.js';
import { fileURLToPath } from 'url';
import path from 'path';

const router = express.Router();

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function PATERSON_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
        
        try {
            const items = ["Safari"];
            function selectRandomItem(array) {
                const randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            const randomItem = selectRandomItem(items);
            
            const sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connection == "open") {
                    await delay(5000);
                    const credsPath = path.join(__dirname, `temp/${id}/creds.json`);
                    
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

                    try {
                        const randomText = generateRandomText();
                        const mega_url = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        const md = "paterson~" + string_session;
                        
                        const code = await sock.sendMessage(sock.user.id, { text: md });
                        
                        const desc = `*Hey there, PATERSON-MD User!* 👋🏻

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
                                    title: "ᴘᴀᴛᴇʀsᴏɴ-ᴍᴅ",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }  
                            }
                        }, { quoted: code });

                    } catch (e) {
                        const errorMsg = await sock.sendMessage(sock.user.id, { text: e.message });
                        
                        const desc = `*Hey there, PATERSON-MD User!* 👋🏻

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
                                    title: "ᴘᴀᴛᴇʀsᴏɴ-ᴍᴅ",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 2,
                                    renderLargerThumbnail: true,
                                    showAdAttribution: true
                                }  
                            }
                        }, { quoted: errorMsg });
                    }

                    await delay(10);
                    await sock.ws.close();
                    await removeFile(`./temp/${id}`);
                    console.log(`👤 ${sock.user.id} 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 ✅ 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗽𝗿𝗼𝗰𝗲𝘀𝘀...`);
                    await delay(10);
                    process.exit();
                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(10);
                    PATERSON_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("service restarted");
            await removeFile(`./temp/${id}`);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }
   
    return await PATERSON_MD_PAIR_CODE();
});

export default router;
