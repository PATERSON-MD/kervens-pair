// 📁 plugins/💬️/settings.js
// =================================================================
// ATTENTION : NE PAS PARTAGER CE FICHIER - IL CONTIENT UNE CLÉ SECRÈTE
// =================================================================

module.exports = {
  // 🔒 CORE SETTINGS
  core: {
    prefix: ".",
    owners: ["50942737567@c.us"], // Remplacez par votre numéro
    sessionPath: "./session.json",
    logLevel: "debug",
    autoUpdate: true,
    repoBranch: "PATERSON-MD"
  },

  // 🤖 AI MODULE
  ai: {
    enabled: true,
    // ⚠️ CLÉ API - À PROTÉGER ABSOLUMENT ⚠️
    apiKey: "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", clé open ai", // Remplacez par votre nouvelle clé
    model: "gpt-4-turbo",
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: "Tu es PATERSON-MD, assistant WhatsApp"
  },

  // 🎮 FUN & GAMES
  entertainment: {
    maxJokes: 3,
    jokeBlacklist: ["dark"],
    games: {
      enabled: true,
      currency: "XP",
      betLimits: [10, 1000]
    }
  },

  // 👥 GROUP MANAGEMENT
  group: {
    welcomeMessage: "👋 Bienvenue {user} !",
    farewellMessage: "😢 Adieu {user}...",
    antiSpam: {
      enabled: true,
      maxMessages: 5,
      action: "mute"
    },
    promotions: {
      coAdmins: true,
      reactionThreshold: 5
    }
  },

  // ⚙️ TOOLS & DOWNLOADS
  utilities: {
    download: {
      maxSizeMB: 50,
      allowedTypes: ["image", "video", "pdf"],
      savePath: "./downloads/"
    },
    converters: {
      currencyAPI: "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", clé open ai", // Obtenez une clé sur exchangerate-api.com
      units: ["kg", "lb", "km", "mile"]
    }
  },

  // 🐞 BUG REPORTING
  bugTracking: {
    channelID: "120363xxxxxx@g.us",
    autoNotify: true,
    logErrors: true,
    githubIssue: true
  },

  // 🖥️ MENU SYSTEM
  menuConfig: {
    style: "modern",
    categories: [
      { name: "IA", emoji: "🤖", plugins: ["ai"] },
      { name: "Groupes", emoji: "👥", plugins: ["group"] },
      { name: "Outils", emoji: "🧰", plugins: ["tools", "download"] },
      { name: "Jeux", emoji: "🎮", plugins: ["games", "fun"] }
    ],
    footerText: "PATERSON-MD v3.6 © 2025"
  },

  // 🔐 SECURITY OVERRIDES
  security: {
    restrictedCommands: {
      eval: ["owner"],
      update: ["owner", "coadmin"]
    },
    blockNSFW: true,
    maxFileUploads: 3
  }
};
