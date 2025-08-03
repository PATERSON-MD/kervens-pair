function makeid(length = 12) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = characters + specialChars;
  
  // Toujours commencer par une lettre pour une compatibilité maximale
  let result = characters.charAt(Math.floor(Math.random() * 52));
  
  // Générer le reste de l'ID
  for (let i = 1; i < length; i++) {
    result += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  return result;
}

module.exports = { makeid };
