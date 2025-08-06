const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage, getAnti } = require('../data');
const config = require('../settings');

const AntiDelete = async (conn, updates) => {
    // Check if the anti-delete feature is enabled first to save resources
    const antiDeleteStatus = await getAnti();
    if (!antiDeleteStatus) return;

    for (const update of updates) {
        // Only process updates that are message deletions
        if (update.update.message === null && update.key.fromMe === false) {
            const store = await loadMessage(update.key.id);

            if (store && store.message) {
                const mek = store.message;
                const isGroup = isJidGroup(store.jid);
                
                // Determine the recipient for the recovered message
                const jid = config.ANTI_DEL_PATH === 'inbox' ? conn.user.id : store.jid;
                
                const deleteTime = new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });
                
                const getSender = (participant) => (participant ? participant.split('@')[0] : 'Inconnu');

                const senderNumber = getSender(mek.key.participant || mek.key.remoteJid);
                const deleterNumber = getSender(update.key.participant || update.key.remoteJid);

                let deleteInfo = `
╭─❍ *Anti-suppression | PATERSON-MD* ┊
┊📲 *Expéditeur*: @${senderNumber}
┊
┊⏰ *Heure de suppression*: ${deleteTime}
┊
┊🗑️ *Supprimé par*: @${deleterNumber}
┊
╰────
`;
                // Add group specific information if it's a group chat
                if (isGroup) {
                    const groupMetadata = await conn.groupMetadata(store.jid);
                    const groupName = groupMetadata.subject;
                    deleteInfo = `
╭─❍ *Anti-suppression | PATERSON-MD*
┊
┊👥 *Groupe*: ${groupName}
┊
┊📲 *Expéditeur*: @${senderNumber}
┊
┊⏰ *Heure de suppression*: ${deleteTime}
┊
┊🗑️ *Supprimé par*: @${deleterNumber}
┊
╰────
`;
                }

                // Check for different message types and handle them
                const messageType = Object.keys(mek.message)[0];
                const quoted = {
                    key: mek.key,
                    message: mek.message,
                };
                
                // If it's text, append the content and send as a text message
                if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
                    const messageContent = mek.message?.conversation || mek.message?.extendedTextMessage?.text || 'Contenu inconnu';
                    deleteInfo += `
╭─❍ *Contenu du message*
┊
┊💬 *Message*: ${messageContent}
╰────
`;
                    await conn.sendMessage(jid, {
                        text: deleteInfo,
                        contextInfo: {
                            mentionedJid: [
                                ...(isGroup && mek.key.participant ? [mek.key.participant] : []),
                                ...(isGroup && update.key.participant ? [update.key.participant] : []),
                                ...(!isGroup && mek.key.remoteJid ? [mek.key.remoteJid] : []),
                            ].filter(Boolean),
                        },
                    }, { quoted });
                } else {
                    // For media, relay the original message with a new caption
                    const antideletedmek = { ...mek.message }; // Use spread operator for a shallow copy
                    if (antideletedmek[messageType]) {
                        antideletedmek[messageType].contextInfo = {
                            stanzaId: mek.key.id,
                            participant: mek.key.participant,
                            quotedMessage: mek.message,
                        };
                        antideletedmek[messageType].caption = `${deleteInfo}
╭─❍ *Type de média*: ${messageType}
╰────
`;
                    }
                    await conn.relayMessage(jid, antideletedmek, { messageId: mek.key.id });
                }
            }
        }
    }
};

module.exports = {
    AntiDelete,
};
