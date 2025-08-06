const { proto, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys')
const fs = require('fs')

/**
 * @description Télécharge un média depuis un message WhatsApp.
 * @param {object} m - Le message WhatsApp.
 * @param {string} [filename] - Le nom de fichier pour l'enregistrement local (optionnel).
 * @returns {Promise<Buffer|undefined>} Le buffer du média, ou undefined en cas d'erreur.
 */
const downloadMediaMessage = async (m, filename) => {
    let messageType = getContentType(m.message);
    if (messageType === 'viewOnceMessage') {
        m.message = m.message.viewOnceMessage.message;
        messageType = getContentType(m.message);
    }
    
    let stream;
    let fileExtension;

    switch (messageType) {
        case 'imageMessage':
            stream = await downloadContentFromMessage(m.message.imageMessage, 'image');
            fileExtension = '.jpg';
            break;
        case 'videoMessage':
            stream = await downloadContentFromMessage(m.message.videoMessage, 'video');
            fileExtension = '.mp4';
            break;
        case 'audioMessage':
            stream = await downloadContentFromMessage(m.message.audioMessage, 'audio');
            fileExtension = '.mp3';
            break;
        case 'stickerMessage':
            stream = await downloadContentFromMessage(m.message.stickerMessage, 'sticker');
            fileExtension = '.webp';
            break;
        case 'documentMessage':
            stream = await downloadContentFromMessage(m.message.documentMessage, 'document');
            // Gérer l'extension du document
            let docName = m.message.documentMessage.fileName || 'file';
            fileExtension = `.${docName.split('.').pop()}`;
            break;
        default:
            console.error('Unsupported media type:', messageType);
            return undefined;
    }

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    if (filename) {
        fs.writeFileSync(`${filename}${fileExtension}`, buffer);
    }

    return buffer;
};

/**
 * @description Analyse et enrichit un objet message WhatsApp.
 * @param {object} conn - La connexion Baileys.
 * @param {object} m - Le message brut.
 * @param {object} store - Le store de messages.
 * @returns {object} Le message enrichi.
 */
const sms = (conn, m, store) => {
    if (!m) return m;
    const M = proto.WebMessageInfo;

    // Analyse des informations de base
    if (m.key) {
        m.id = m.key.id;
        m.isBot = m.id.startsWith('BAE5') && m.id.length === 16;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : m.isGroup ? m.key.participant : m.key.remoteJid;
    }

    // Analyse du contenu du message
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = m.mtype === 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype];

        try {
            m.body = m.mtype === 'conversation' ? m.message.conversation :
                     m.mtype === 'imageMessage' && m.message.imageMessage.caption !== undefined ? m.message.imageMessage.caption :
                     m.mtype === 'videoMessage' && m.message.videoMessage.caption !== undefined ? m.message.videoMessage.caption :
                     m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text !== undefined ? m.message.extendedTextMessage.text :
                     m.mtype === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                     m.mtype === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                     m.mtype === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                     m.mtype === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : '';
        } catch {
            m.body = false;
        }

        const quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null;
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];

        if (quoted) {
            let quotedType = getContentType(quoted);
            
            m.quoted = m.msg.contextInfo.quotedMessage[quotedType];

            if (quotedType === 'productMessage') {
                quotedType = getContentType(m.quoted);
                m.quoted = m.quoted[quotedType];
            }

            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };

            m.quoted.mtype = quotedType;
            m.quoted.id = m.msg.contextInfo.stanzaId;
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
            m.quoted.isBot = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false;
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false;
            m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
            m.quoted.fromMe = m.quoted.sender === (conn.user && conn.user.id);
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || '';
            m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
            
            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false;
                let q = await store.loadMessage(m.chat, m.quoted.id, conn);
                return q ? sms(conn, q, store) : false;
            };

            const key = {
                remoteJid: m.chat,
                fromMe: false,
                id: m.quoted.id,
                participant: m.quoted.sender
            };
            m.quoted.delete = async () => await conn.sendMessage(m.chat, { delete: key });
            m.quoted.download = () => downloadMediaMessage(m.quoted);
        }
    }
    
    // Ajout de fonctions d'aide
    m.download = () => downloadMediaMessage(m.msg);
    m.text = m.msg.text || m.msg.caption || m.message?.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || '';
    m.copy = () => sms(conn, M.fromObject(M.toObject(m)), store);
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options);
    
    // Fonctions de réponse simplifiées
    m.reply = async (content, opt = { packname: "PATERSON-MD", author: "kervens Aubourg" }) => {
        return conn.sendMessage(m.chat, { text: content }, { quoted: m });
    };
    m.replyimg = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { image: img, caption: teks, contextInfo: { mentionedJid: option.mentions } }, { quoted: m });
    m.imgurl = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => conn.sendMessage(id, { image: { url: img }, caption: teks, contextInfo: { mentionedJid: option.mentions } }, { quoted: m });
    m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    
    m.sendcontact = (name, info, number) => {
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${info};\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;
        conn.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: m });
    };

    return m;
};

module.exports = { sms, downloadMediaMessage };
