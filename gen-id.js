/**
 * Générateur d'ID sécurisé pour PATERSON-MD
 * Crée des identifiants uniques pour les fichiers et tokens
 */

function makeid(length = 12) {
  // Caractères autorisés - version optimisée sans ambiguïté
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Retirer I et O pour éviter la confusion
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';   // Retirer i, l, o pour éviter la confusion
  const numbers = '23456789';                    // Retirer 0, 1 pour éviter la confusion avec O, I, l
  
  // Combinaison de tous les caractères
  const allChars = uppercase + lowercase + numbers;
  
  // Toujours commencer par une lettre majuscule pour la compatibilité
  let result = uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  
  // Générer le reste de l'ID de manière sécurisée
  for (let i = 1; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    result += allChars.charAt(randomIndex);
  }
  
  return result;
}

/**
 * Génère un ID de fichier unique avec timestamp
 */
function generateFileId(prefix = 'file') {
  const timestamp = Date.now().toString(36); // Timestamp en base36
  const randomPart = makeid(6);
  return `${prefix}_${timestamp}_${randomPart}`;
}

/**
 * Génère un token d'authentification sécurisé
 */
function generateAuthToken(length = 24) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  
  // Utilisation de crypto si disponible pour plus de sécurité
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
  } else {
    // Fallback pour les environnements sans crypto
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return token;
}

/**
 * Vérifie si un ID est valide selon nos critères
 */
function isValidId(id, minLength = 8, maxLength = 32) {
  if (typeof id !== 'string') return false;
  if (id.length < minLength || id.length > maxLength) return false;
  
  // Expression régulière pour valider le format
  const regex = /^[A-Z][A-Za-z0-9]{7,31}$/;
  return regex.test(id);
}

/**
 * Génère un code numérique pour les vérifications
 */
function generateNumericCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10); // Chiffres de 0 à 9
  }
  return code;
}

/**
 * Génère un ID pour les groupes temporaires
 */
function generateTempId() {
  const timestamp = Date.now().toString(36).slice(-4);
  const randomPart = makeid(4);
  return `temp_${timestamp}_${randomPart}`.toLowerCase();
}

module.exports = {
  makeid,
  generateFileId,
  generateAuthToken,
  generateNumericCode,
  generateTempId,
  isValidId
};
