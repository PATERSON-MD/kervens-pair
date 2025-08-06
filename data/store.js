const { isJidBroadcast, isJidGroup, isJidNewsletter } = require('@whiskeysockets/baileys');
const fs = require('fs').promises;
const path = require('path');
const { DATABASE } = require('../lib/database');
const logger = require('../lib/logger'); // Assurez-vous d'avoir un logger configuré

// Configuration
const STORE_DIR = path.join(process.cwd(), 'store');
const DB_MODE = process.env.DB_MODE === 'sequelize'; // Mode base de données activable
const JSON_BACKUP = true; // Sauvegarde JSON même en mode DB

// Modèle Sequelize pour les messages (si DB_MODE activé)
const MessageDB = DB_MODE ? DATABASE.define('Message', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    jid: DataTypes.STRING,
    message: DataTypes.JSON,
    timestamp: DataTypes.BIGINT,
    sender: DataTypes.STRING,
}, {
    tableName: 'messages',
    timestamps: false,
}) : null;

// ===========================================================
//  UTILITAIRES DE BASE
// ===========================================================
const ensureStoreDir = async () => {
    try {
        await fs.mkdir(STORE_DIR, { recursive: true });
    } catch (error) {
        logger.error('Could not create store directory', error);
    }
};

const getFilePath = (filename) => path.join(STORE_DIR, filename);

// ===========================================================
//  GESTION DES FICHIERS JSON (BACKUP)
// ===========================================================
const readJSON = async (filename) => {
    await ensureStoreDir();
    const filePath = getFilePath(filename);
    
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            logger.warn(`Error reading ${filename}:`, error);
        }
        return [];
    }
};

const writeJSON = async (filename, data) => {
    await ensureStoreDir();
    const filePath = getFilePath(filename);
    
    try {
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonData);
    } catch (error) {
        logger.error(`Error writing ${filename}:`, error);
    }
};

// ===========================================================
//  GESTION DES CONTACTS
// ===========================================================
const saveContact = async (jid, name) => {
    if (!jid || !name || 
        isJidGroup(jid) || 
        isJidBroadcast(jid) || 
        isJidNewsletter(jid)) return false;

    try {
        const contacts = await readJSON('contacts.json');
        const existingIndex = contacts.findIndex(c => c.jid === jid);

        if (existingIndex > -1) {
            // Mise à jour si le nom a changé
            if (contacts[existingIndex].name !== name) {
                contacts[existingIndex].name = name;
                await writeJSON('contacts.json', contacts);
                logger.info(`Updated contact: ${jid}`);
            }
        } else {
            // Nouveau contact
            contacts.push({ jid, name, timestamp: Date.now() });
            await writeJSON('contacts.json', contacts);
            logger.info(`Added new contact: ${jid}`);
        }
        return true;
    } catch (error) {
        logger.error('Error saving contact:', error);
        return false;
    }
};

const getContacts = async () => {
    return await readJSON('contacts.json');
};

const getName = async (jid) => {
    const contacts = await getContacts();
    const contact = contacts.find(c => c.jid === jid);
    
    if (contact) return contact.name;
    
    // Fallback pour les numéros non enregistrés
    return jid.split('@')[0]
        .replace(/[^a-z0-9]/gi, ' ')
        .trim();
};

// ===========================================================
//  GESTION DES MESSAGES
// ===========================================================
const saveMessage = async (message) => {
    if (!message?.key?.id) return false;
    
    const { id, remoteJid: jid } = message.key;
    const sender = message.key.participant || message.key.remoteJid;
    const timestamp = message.messageTimestamp * 1000 || Date.now();

    try {
        // Sauvegarde dans la base de données si activée
        if (DB_MODE) {
            await MessageDB.upsert({
                id,
                jid,
                sender,
                message,
                timestamp
            });
        }

        // Sauvegarde JSON de backup
        if (JSON_BACKUP) {
            const messages = await readJSON('messages.json');
            const existingIndex = messages.findIndex(m => m.id === id && m.jid === jid);
            
            const messageData = {
                id,
                jid,
                sender,
                message,
                timestamp
            };

            if (existingIndex > -1) {
                messages[existingIndex] = messageData;
            } else {
                messages.push(messageData);
            }

            await writeJSON('messages.json', messages);
        }

        // Enregistrer le contact si c'est un nouveau message
        if (message.pushName) {
            await saveContact(sender, message.pushName);
        }

        logger.debug(`Saved message ${id} from ${jid}`);
        return true;
    } catch (error) {
        logger.error('Error saving message:', error);
        return false;
    }
};

const loadMessage = async (messageId) => {
    if (!messageId) return null;

    try {
        // Recherche dans la base de données
        if (DB_MODE) {
            const dbMessage = await MessageDB.findByPk(messageId);
            if (dbMessage) return dbMessage.get({ plain: true });
        }

        // Fallback sur JSON
        const messages = await readJSON('messages.json');
        return messages.find(m => m.id === messageId) || null;
    } catch (error) {
        logger.error('Error loading message:', error);
        return null;
    }
};

// ===========================================================
//  GESTION DES GROUPES
// ===========================================================
const saveGroupMetadata = async (jid, client) => {
    if (!isJidGroup(jid)) return false;

    try {
        const metadata = await client.groupMetadata(jid);
        const metadataList = await readJSON('groups.json');
        
        const groupData = {
            id: metadata.id,
            subject: metadata.subject,
            owner: metadata.owner,
            desc: metadata.desc,
            size: metadata.size,
            restrict: metadata.restrict,
            announce: metadata.announce,
            creation: metadata.creation ? new Date(metadata.creation * 1000) : null,
            participants: metadata.participants.map(p => ({
                id: p.id,
                admin: p.admin
            })),
            lastUpdated: new Date()
        };

        const groupIndex = metadataList.findIndex(g => g.id === jid);
        
        if (groupIndex > -1) {
            metadataList[groupIndex] = groupData;
        } else {
            metadataList.push(groupData);
        }

        await writeJSON('groups.json', metadataList);
        logger.info(`Updated group metadata: ${jid}`);
        return true;
    } catch (error) {
        logger.error('Error saving group metadata:', error);
        return false;
    }
};

const getGroupMetadata = async (jid) => {
    if (!isJidGroup(jid)) return null;
    
    try {
        const groups = await readJSON('groups.json');
        return groups.find(g => g.id === jid) || null;
    } catch (error) {
        logger.error('Error loading group metadata:', error);
        return null;
    }
};

// ===========================================================
//  STATISTIQUES DES MESSAGES
// ===========================================================
const saveMessageCount = async (message) => {
    if (!message?.key?.remoteJid || !isJidGroup(message.key.remoteJid)) return;
    
    const jid = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;

    try {
        const stats = await readJSON('message_stats.json');
        const groupIndex = stats.findIndex(s => s.jid === jid);
        
        if (groupIndex === -1) {
            // Nouveau groupe
            stats.push({
                jid,
                members: {
                    [sender]: 1
                },
                total: 1
            });
        } else {
            // Mise à jour existante
            const group = stats[groupIndex];
            group.total = (group.total || 0) + 1;
            group.members[sender] = (group.members[sender] || 0) + 1;
        }

        await writeJSON('message_stats.json', stats);
    } catch (error) {
        logger.error('Error saving message stats:', error);
    }
};

const getGroupMessageStats = async (jid) => {
    try {
        const stats = await readJSON('message_stats.json');
        const groupStats = stats.find(s => s.jid === jid);
        
        if (!groupStats) return { total: 0, members: {} };
        
        // Trier les membres par activité
        const sortedMembers = Object.entries(groupStats.members)
            .sort((a, b) => b[1] - a[1])
            .map(([member, count]) => ({ member, count }));
        
        return {
            total: groupStats.total,
            members: sortedMembers
        };
    } catch (error) {
        logger.error('Error loading group stats:', error);
        return { total: 0, members: [] };
    }
};

const getInactiveGroupMembers = async (jid, threshold = 0) => {
    try {
        const stats = await getGroupMessageStats(jid);
        return Object.entries(stats.members)
            .filter(([_, count]) => count <= threshold)
            .map(([member]) => member);
    } catch (error) {
        logger.error('Error finding inactive members:', error);
        return [];
    }
};

// ===========================================================
//  RÉSUMÉ DES CONVERSATIONS
// ===========================================================
const getChatSummary = async () => {
    try {
        const messages = await readJSON('messages.json');
        const conversations = {};
        
        // Grouper les messages par conversation
        messages.forEach(msg => {
            if (!conversations[msg.jid]) {
                conversations[msg.jid] = {
                    messageCount: 0,
                    lastMessage: 0
                };
            }
            
            conversations[msg.jid].messageCount++;
            if (msg.timestamp > conversations[msg.jid].lastMessage) {
                conversations[msg.jid].lastMessage = msg.timestamp;
            }
        });
        
        // Créer le résumé
        return Object.entries(conversations).map(([jid, data]) => ({
            jid,
            name: jid, // À remplacer par getName si nécessaire
            messageCount: data.messageCount,
            lastActive: data.lastMessage
        })).sort((a, b) => b.lastActive - a.lastActive);
    } catch (error) {
        logger.error('Error generating chat summary:', error);
        return [];
    }
};

// ===========================================================
//  EXPORT DES FONCTIONS
// ===========================================================
module.exports = {
    saveContact,
    getContacts,
    getName,
    saveMessage,
    loadMessage,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getGroupMessageStats,
    getInactiveGroupMembers,
    getChatSummary
};
