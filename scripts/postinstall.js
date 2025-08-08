#!/usr/bin/env node
// scripts/postinstall.js

const fs = require('fs');
const path = require('path');

try {
  console.log('✅ Début du script postinstall');
  
  // 1. Vérification des variables d'environnement
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️ Fichier .env non trouvé. Créez-en un basé sur .env.example');
  }

  // 2. Message de succès
  console.log('✨ Script postinstall exécuté avec succès');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Erreur dans postinstall:', error.message);
  process.exit(1);
}
