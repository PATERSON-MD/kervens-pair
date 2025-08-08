cat > scripts/postinstall.js << 'EOF'
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('✅ Début du script postinstall');
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️ Fichier .env non trouvé. Créez-en un basé sur .env.example');
  }

  console.log('✨ Script postinstall exécuté avec succès');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Erreur dans postinstall:', error.message);
  process.exit(1);
}
EOF
