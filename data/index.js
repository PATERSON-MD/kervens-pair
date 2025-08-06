/**
 * Fichier d'export centralisé pour les fonctions de base de données
 * Regroupe les fonctionnalités de gestion des messages, contacts, groupes et paramètres
 */

// =====================================================
//  ANTI-DELETE SETTINGS (Paramètres anti-suppression)
// =====================================================
const {
    AntiDelDB,                      // Modèle Sequelize pour les paramètres anti-suppression
    initializeAntiDeleteSettings,    // Initialise les paramètres anti-suppression
    setAnti,                        // Configure les paramètres anti-suppression
    getAnti                         // Récupère les paramètres anti-suppression
} = require('./antidel');

// =====================================================
//  MESSAGE STORAGE (Stockage des messages)
// =====================================================
const {
    saveMessage,    // Sauvegarde un message dans la base de données
    loadMessage,    // Charge un message à partir de son ID
    saveMessageCount // Sauvegarde le compteur de messages
} = require('./store');

// =====================================================
//  CONTACT MANAGEMENT (Gestion des contacts)
// =====================================================
const {
    saveContact,    // Sauvegarde les informations d'un contact
    getName         // Récupère le nom d'un contact
} = require('./store');

// =====================================================
//  GROUP MANAGEMENT (Gestion des groupes)
// =====================================================
const {
    saveGroupMetadata,          // Sauvegarde les métadonnées d'un groupe
    getGroupMetadata,           // Récupère les métadonnées d'un groupe
    getInactiveGroupMembers,    // Récupère les membres inactifs d'un groupe
    getGroupMembersMessageCount // Compte les messages par membre dans un groupe
} = require('./store');

// =====================================================
//  CHAT UTILITIES (Utilitaires de discussion)
// =====================================================
const {
    getChatSummary  // Génère un résumé de conversation
} = require('./store');

// =====================================================
//  EXPORT UNIFIÉ
// =====================================================
module.exports = {
    // Anti-delete
    AntiDelDB,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    
    // Messages
    saveMessage,
    loadMessage,
    saveMessageCount,
    
    // Contacts
    saveContact,
    getName,
    
    // Groupes
    saveGroupMetadata,
    getGroupMetadata,
    getInactiveGroupMembers,
    getGroupMembersMessageCount,
    
    // Utilitaires
    getChatSummary
};
