## Configuration Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# 🔒 REQUIS
OPENAI_API_KEY="."
ENCRYPTION_KEY="32_caractères_aléatoires"
BOT_OWNERS="50942737567@c.us"

# 🌐 OPTIONNEL
PORT=3000
LOG_LEVEL="info"
DB_URI="mongodb://user:pass@localhost:27017/dbname"
```

### Génération de clé
```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

### Variables importantes
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Clé API OpenAI (obtenue sur [platform.openai.com](https://platform.openai.com/account/api-keys)) |
| `ENCRYPTION_KEY` | Clé de 32 caractères pour le chiffrement des données |
| `BOT_OWNERS` | Numéros WhatsApp des administrateurs (séparés par des virgules) |
| `PORT` | Port pour le serveur web interne (défaut: 3000) |
