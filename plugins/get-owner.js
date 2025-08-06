const { lite } = require('../lite');
const config = require('../settings');

lite({
    pattern: "owner",
    react: "✅", 
    desc: "Obtenir les coordonnées du propriétaire",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from }) => {
    try {
        // Informations du propriétaire
        const ownerNumber = "+50942737568";
        const ownerName = "Aubourg Kervens";
        
        // Création de la vCard
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:${config.BOT_NAME || "PATERSON-MD"};
TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}
X-WA-BIZ-DESCRIPTION:Propriétaire du bot ${config.BOT_NAME || "PATERSON-MD"}
END:VCARD`;

        // Envoi de la carte de contact
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mek });

        // Envoi d'un message supplémentaire (optionnel)
        await conn.sendMessage(from, {
            text: `👑 *Propriétaire du Bot*\n
Nom: *${ownerName}*
Numéro: *${ownerNumber}*
Bot: *${config.BOT_NAME || "PATERSON-MD"}*`
        }, { quoted: mek });

    } catch (error) {
        console.error("Erreur commande owner:", error);
        await conn.sendMessage(from, { 
            text: `❌ Erreur lors de la récupération des coordonnées: ${error.message}` 
        }, { quoted: mek });
    }
});
