const fs = require('fs');
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

// VOTRE SESSION - Ajoutez-la ici
const config = {
  SESSION_ID: "paterson~eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoieURZcjdBTjI4TFlEMkpTNjN3SlV2S25YZXBsNmhKU0pXMU5CZndXdzczST0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiak51NXR2RnF2dVV1Q3FQMEhmZ0RnWm9aWVRQMkFnNXNJc1JSZ1hIS3VRWT0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJXRXFSb1ovcEhyNzJ1K0Iyd2dVRVl3TjBGbzJmNkRIQldQc1J4b0R1MEdvPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJUelZZWk81VmMrQitFNXBWeTZXS2F0OTVxWFdUeEZYMDNtUVdFS2FMZVJNPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImtLWm50Vm1LOFFoaU44cklFSWlUKzc1d1NiaXVQNE95Zkpack11Z05xMG89In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InFCZmViSE1vQlo4Nm4zQU81czZ5cW5QcVd3bVFlWmJZcTc0WFVvRHFkVEk9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiR0YvbGluVklkVVh3NEFoSWJSTkJhTy9IcFcwanB6OEcvZVFwenJVOFRYUT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiMUgwVUtCWEE1VXd3eWRWUHFZbFlwL3o5VEFhdDZsQ1FIM3RnR0poRHVXYz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkQ5NzN2QVdLdW45NEloS0lRK1dPMm41bVFKZTdQZEs2engxdzBZT2ZrLzFFZDN2WE9qSmVtZDRzdE8wVkhxdFNmSENTczV3bk82TzhUcGFaa1FUbGdnPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6NjAsImFkdlNlY3JldEtleSI6Ik1WSUZZZVVMUHJibHZoSldzczJhbjN4aG5DcGdRQmpUMkpOSVlMR2lpcDA9IiwicHJvY2Vzc2VkSGlzdG9yeU1lc3NhZ2VzIjpbXSwibmV4dFByZUtleUlkIjozMSwiZmlyc3RVbnVwbG9hZGVkUHJlS2V5SWQiOjMxLCJhY2NvdW50U3luY0NvdW50ZXIiOjAsImFjY291bnRTZXR0aW5ncyI6eyJ1bmFyY2hpdmVDaGF0cyI6ZmFsc2V9LCJyZWdpc3RlcmVkIjp0cnVlLCJwYWlyaW5nQ29kZSI6IjM5VkxRUUVBIiwibWUiOnsiaWQiOiI1MDk0MjczNzU2NzoxNUBzLndoYXRzYXBwLm5ldCIsIm5hbWUiOiLwnZWC8J2UvOKEnfCdlY3wnZS84oSV8J2ViiDwnZWC8J2VgOKElfCdlL4iLCJsaWQiOiI2ODAwNzIxNjg0NDgzNToxNUBsaWQifSwiYWNjb3VudCI6eyJkZXRhaWxzIjoiQ09LYTJMUUVFSnVZOWNVR0dBc2dBQ2dBIiwiYWNjb3VudFNpZ25hdHVyZUtleSI6IldYVTNoTnlPcG5vUGtYMzU4d1BnYmxISDRTaEoxNXhrTTBaZDdwcktFQW89IiwiYWNjb3VudFNpZ25hdHVyZSI6IkFHbEh2bEJnRU5Ocm1NUUdmUWszNmh5WnBTdjFRNkpKaVVVNGRmZFpVSmpFN1pGYkF3OFNubml4MHdUTk5Md1JWMDdxMFZBbEtJWDVhSjlVbFI1UkNRPT0iLCJkZXZpY2VTaWduYXR1cmUiOiJFdGJIZXVPUkZNek0rSmVmc1Y4WFU3ZGdmUlZwa3crZkVYUUhVQTIrTVJZOWxBbWZZRVBiL2toc2NyRmcvcjkxL1VqcVpNcFk2MVZOeDNlMjFmM01pZz09In0sInNpZ25hbElkZW50aXRpZXMiOlt7ImlkZW50aWZpZXIiOnsibmFtZSI6IjUwOTQyNzM3NTY3OjE1QHMud2hhdHNhcHAubmV0IiwiZGV2aWNlSWQiOjB9LCJpZGVudGlmaWVyS2V5Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQlZsMU40VGNqcVo2RDVGOStmTUQ0RzVSeCtFb1NkZWNaRE5HWGU2YXloQUsifX1dLCJwbGF0Zm9ybSI6InNtYmEiLCJyb3V0aW5nSW5mbyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IkNCSUlBZz09In0sImxhc3RBY2NvdW50U3luY1RpbWVzdGFtcCI6MTc1NzIzNjI2NiwibGFzdFByb3BIYXNoIjoiM2dQVUprIn0="
};

// Charger la session au démarrage
if (config.SESSION_ID) {
  loadBase64Session(config.SESSION_ID).then(session => {
    if (session) {
      console.log("✅ Session chargée avec succès");
      console.log("👤 Utilisateur:", session.me?.name || "Inconnu");
      console.log("📱 Numéro:", session.me?.id || "Inconnu");
    } else {
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
