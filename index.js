constconst fs = require('fs');
const path = require('path');

// Session directory setup
const sessionDir = path.join(__dirname, "./sessions");
const credsPath = path.join(sessionDir, "creds.json");

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

/**
 * Decodes and saves a base64 session (paterson~ prefixed)
 * @param {string} base64Session - Format: "paterson~BASE64_DATA"
 */
async function loadBase64Session(base64Session) {
  try {
    if (!base64Session.startsWith("paterson~")) {
      throw new Error("Invalid format: Session must start with 'paterson~'");
    }

    const base64Data = base64Session.replace("paterson~", "");
    
    // Validate base64
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      throw new Error("Invalid base64 characters detected");
    }

    // Decode and parse
    const decodedData = Buffer.from(base64Data, "base64");
    const sessionData = JSON.parse(decodedData.toString("utf-8"));

    // Save to file
    fs.writeFileSync(credsPath, decodedData);
    console.log("✅ Session paterson décodée et sauvegardée avec succès");
    return sessionData;

  } catch (error) {
    console.error("❌ Erreur de session paterson:", error.message);
    return null;
  }
}

/**
 * Encode current session to paterson format
 */
function encodeSessionToPaterson() {
  try {
    if (!fs.existsSync(credsPath)) {
      throw new Error("Aucun fichier de session trouvé");
    }

    const sessionData = fs.readFileSync(credsPath);
    const base64Data = sessionData.toString('base64');
    const patersonSession = `paterson~${base64Data}`;

    console.log("✅ Session encodée en format paterson");
    return patersonSession;

  } catch (error) {
    console.error("❌ Erreur d'encodage paterson:", error.message);
    return null;
  }
}

// Usage Example:
const config = {
  SESSION_ID: "paterson~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Votre session paterson
};

if (config.SESSION_ID) {
  loadBase64Session(config.SESSION_ID).then(session => {
    if (!session) {
      console.log("🔄 Retour à l'authentification par QR code/code de pairing");
      // Initier le flux d'authentification normal ici
    }
  });
}

// Exporter les fonctions pour une utilisation ailleurs
module.exports = {
  loadBase64Session,
  encodeSessionToPaterson,
  sessionDir,
  credsPath
}; fs = require('fs');
const path = require('path');

// Session directory setup
const sessionDir = path.join(__dirname, "./sessions");
const credsPath = path.join(sessionDir, "creds.json");

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

/**
 * Decodes and saves a base64 session (paterson~ prefixed)
 * @param {string} base64Session - Format: "paterson~BASE64_DATA"
 */
async function loadBase64Session(base64Session) {
  try {
    if (!base64Session.startsWith("paterson~")) {
      throw new Error("Invalid format: Session must start with 'paterson~'");
    }

    const base64Data = base64Session.replace("paterson~", "");
    
    // Validate base64
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      throw new Error("Invalid base64 characters detected");
    }

    // Decode and parse
    const decodedData = Buffer.from(base64Data, "base64");
    const sessionData = JSON.parse(decodedData.toString("utf-8"));

    // Save to file
    fs.writeFileSync(credsPath, decodedData);
    console.log("✅ Session paterson décodée et sauvegardée avec succès");
    return sessionData;

  } catch (error) {
    console.error("❌ Erreur de session paterson:", error.message);
    return null;
  }
}

/**
 * Encode current session to paterson format
 */
function encodeSessionToPaterson() {
  try {
    if (!fs.existsSync(credsPath)) {
      throw new Error("Aucun fichier de session trouvé");
    }

    const sessionData = fs.readFileSync(credsPath);
    const base64Data = sessionData.toString('base64');
    const patersonSession = `paterson~${base64Data}`;

    console.log("✅ Session encodée en format paterson");
    return patersonSession;

  } catch (error) {
    console.error("❌ Erreur d'encodage paterson:", error.message);
    return null;
  }
}

// Usage Example:
const config = {
  SESSION_ID: "paterson~eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Votre session paterson
};

if (config.SESSION_ID) {
  loadBase64Session(config.SESSION_ID).then(session => {
    if (!session) {
      console.log("🔄 Retour à l'authentification par QR code/code de pairing");
      // Initier le flux d'authentification normal ici
    }
  });
}

// Exporter les fonctions pour une utilisation ailleurs
module.exports = {
  loadBase64Session,
  encodeSessionToPaterson,
  sessionDir,
  credsPath
};
