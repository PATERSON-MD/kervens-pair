import { makeid } from '../gen-id.js';
import express from 'express';
import QRCode from 'qrcode';
import fs from 'fs';
import pino from 'pino';
import { 
  default as makeWASocket,
  useMultiFileAuthState,
  delay,
  Browsers
} from "@whiskeysockets/baileys";
import { upload } from '../mega.js';

const router = express.Router();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let responseSent = false;

    async function PATERSON_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
        
        try {
            const sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: Browsers.macOS("Desktop"),
            });

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

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
                            res.status(500).json({ error: "QR generation failed" });
                        }
                    }
                }

                if (connection === "open") {
                    try {
                        // Utilisation de import.meta.url pour __dirname
                        const currentDir = new URL('.', import.meta.url).pathname;
                        const credsPath = `${currentDir}temp/${id}/creds.json`;
                        
                        const megaUrl = await upload(fs.createReadStream(credsPath), `${sock.user.id}.json`);
                        const sessionCode = `paterson~${megaUrl.replace('https://mega.nz/file/', '')}`;

                        await sock.sendMessage(sock.user.id, { text: sessionCode });

                        const successMessage = `*Hey there, PATERSON-MD User!* 👋🏻\n\nYour session is ready!\n🔐 *Session ID:* Sent above\n⚠️ *Keep it safe!*\n\nJoin our channel:\nhttps://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20`;
                        
                        await sock.sendMessage(sock.user.id, {
                            text: successMessage,
                            contextInfo: {
                                externalAdReply: {
                                    title: "PATERSON-MD Connected",
                                    thumbnailUrl: "https://i.ibb.co/pXL9RYv/temp-image.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 1
                                }
                            }
                        });

                    } catch (e) {
                        console.error("Session error:", e);
                        await sock.sendMessage(sock.user.id, { 
                            text: `Error: ${e.message}\n\nContact support if this persists.`
                        });
                    } finally {
                        await delay(100);
                        await sock.ws.close();
                        removeFile(`./temp/${id}`);
                    }
                }
            });
        } catch (err) {
            console.error("Setup error:", err);
            if (!responseSent) {
                responseSent = true;
                res.status(500).json({ error: "Initialization failed" });
            }
            removeFile(`./temp/${id}`);
        }
    }

    await PATERSON_MD_PAIR_CODE();
});

export default router;
