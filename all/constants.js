// all/constants.js

module.exports = {
  // ======================
  //  CONFIGURATION DE BASE
  // ======================
  PREFIX: "!",         // Préfixe des commandes
  OWNER: "kervens Aubourg", // Propriétaire du bot
  BOT_NAME: "PATERSON-MD",  // Nom du bot
  VERSION: "1.4.0",    // Version actuelle du bot
  LANGUAGE: "fr",      // Langue principale (fr = français)
  
  // ===================
  //  CHEMINS DES FICHIERS
  // ===================
  MEDIA_PATH: "./media/",           // Dossier des médias
  LOGS_PATH: "./logs/",             // Dossier des logs
  DATABASE_PATH: "./database/",     // Dossier de la base de données
  CONFIG_PATH: "./config.json",     // Fichier de configuration
  
  // =================
  //  FICHIERS MÉDIA
  // =================
  AUDIO: {
    MAIN_MUSIC: "main-music.mp3",   // Musique principale
    NOTIFICATION: "notification.mp3", // Son de notification
    ERROR_SOUND: "error-sound.mp3"   // Son d'erreur
  },
  
  IMAGES: {
    DEFAULT_STICKER: "default.webp", // Sticker par défaut
    THUMBNAIL: "bot-thumbnail.jpg",  // Miniature du bot
    BANNER: "banner.png"             // Bannière du bot
  },
  
  // ================
  //  ÉMOTES/EMOJIS
  // ================
  EMOTES: {
    LOADING: "🔄",
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    MUSIC: "🎵",
    HEART: "💖",
    ROBOT: "🤖"
  },
  
  // =====================
  //  PARAMÈTRES DE PERFORMANCE
  // =====================
  MAX_REQUEST_SIZE: 50 * 1024 * 1024, // 50MB (taille max des fichiers)
  TIMEOUT: 30000,                    // 30s (timeout des requêtes)
  MAX_CONNECTIONS: 10,               // Connexions simultanées max
  
  // =====================
  //  MESSAGES PAR DÉFAUT
  // =====================
  DEFAULT_MESSAGES: {
    WELCOME: "👋 Bienvenue! Tapez !help pour voir les commandes disponibles.",
    HELP: `ℹ️ *Commandes disponibles:*\n`
        + `!menu - Voir le menu principal\n`
        + `!music - Jouer la musique principale\n`
        + `!sticker - Créer un sticker\n`
        + `!info - Infos du bot\n`
        + `!owner - Contacter le propriétaire`,
    ERROR: "❌ Une erreur s'est produite. Veuillez réessayer plus tard.",
    OWNER_INFO: `👤 *Propriétaire:* kervens Aubourg\n`
              + `📧 Contact: kervensaubourg@icloud.com\n`
              + `🌍 Site: https://kervens-aubourg.netlify.app`
  },
  
  // ===================
  //  PARAMÈTRES API
  // ===================
  API_KEYS: {
    OPENAI: process.env.OPENAI_API_KEY || "votre_cle_api_openai",
    GOOGLE: process.env.GOOGLE_API_KEY || "votre_cle_api_google",
    // Ajouter d'autres clés API au besoin
  },
  
  // ===================
  //  CONFIGURATION IA
  // ===================
  AI_SETTINGS: {
    MODEL: "gpt-4-turbo",         // Modèle d'IA à utiliser
    TEMPERATURE: 0.7,             // Créativité des réponses (0-1)
    MAX_TOKENS: 1000,             // Longueur max des réponses
    MEMORY_LENGTH: 10             // Nombre de messages à retenir
  },
  
  // ===================
  //  SÉCURITÉ
  // ===================
  SECURITY: {
    BLOCKED_USERS: [],            // Liste des utilisateurs bloqués
    ALLOWED_GROUPS: [],           // Groupes autorisés (vide = tous)
    ADMIN_NUMBERS: ["+50942737567"] // Numéros administrateurs
  },
  
  // ===================
  //  LOGGING
  // ===================
  LOGGING: {
    LEVEL: "debug",               // Niveau de log (error, warn, info, debug)
    MAX_FILES: 30,                // Nombre max de fichiers de log à conserver
    MAX_FILE_SIZE: "10MB"         // Taille max d'un fichier de log
  }
};
