// plugins/💬️/core/loader.js
const fs = require('fs');
const path = require('path');
const config = require('../settings');

class PluginLoader {
    constructor() {
        this.commands = new Map();
        this.plugins = new Map();
        this.categories = new Set();
    }

    async loadPlugins() {
        // Charger les commandes
        await this._loadDirectory('../commands', 'command');
        
        // Charger les plugins spéciaux
        await this._loadDirectory('../plugins', 'plugin');
        
        console.log(`✅ ${this.commands.size} commandes chargées | ${this.plugins.size} plugins actifs`);
        return {
            commands: this.commands,
            plugins: this.plugins,
            categories: Array.from(this.categories)
        };
    }

    async _loadDirectory(dirPath, type) {
        const fullPath = path.join(__dirname, dirPath);
        
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ Dossier introuvable: ${fullPath}`);
            return;
        }

        const files = fs.readdirSync(fullPath)
            .filter(file => file.endsWith('.js'));
        
        for (const file of files) {
            const filePath = path.join(fullPath, file);
            await this._loadModule(filePath, type);
        }
    }

    async _loadModule(filePath, type) {
        try {
            delete require.cache[require.resolve(filePath)];
            const module = require(filePath);
            
            if (type === 'command' && module.name) {
                this._registerCommand(module);
            } 
            else if (type === 'plugin' && module.pluginName) {
                this._registerPlugin(module);
            }
        } catch (error) {
            console.error(`❌ Erreur de chargement: ${filePath}`, error);
        }
    }

    _registerCommand(command) {
        // Enregistrer la commande principale
        this.commands.set(command.name, command);
        
        // Enregistrer les alias
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.commands.set(alias, command);
            });
        }
        
        // Enregistrer la catégorie
        if (command.category) {
            this.categories.add(command.category);
        }
        
        // Détection automatique de la catégorie
        if (!command.category) {
            const category = this._detectCategory(command.name);
            command.category = category;
            this.categories.add(category);
        }
    }

    _registerPlugin(plugin) {
        this.plugins.set(plugin.pluginName, plugin);
        
        // Initialiser le plugin si nécessaire
        if (typeof plugin.init === 'function') {
            plugin.init(config);
        }
    }

    _detectCategory(commandName) {
        // Logique de détection automatique des catégories
        const categoryMap = {
            gpt: 'AI',
            ai: 'AI',
            chat: 'AI',
            mod: 'Modération',
            kick: 'Modération',
            ban: 'Modération',
            jeu: 'Jeux',
            game: 'Jeux',
            fun: 'Divertissement',
            dl: 'Téléchargements',
            tool: 'Outils'
        };

        for (const [key, category] of Object.entries(categoryMap)) {
            if (commandName.includes(key)) return category;
        }
        
        return 'Autre';
    }

    async reloadCommand(commandName) {
        const command = this.commands.get(commandName);
        if (!command) return false;
        
        const commandPath = path.join(
            __dirname, 
            '../commands', 
            `${commandName}.js`
        );
        
        try {
            delete require.cache[require.resolve(commandPath)];
            const newCommand = require(commandPath);
            this._registerCommand(newCommand);
            return true;
        } catch (error) {
            console.error(`❌ Rechargement échoué: ${commandName}`, error);
            return false;
        }
    }
}

module.exports = new PluginLoader();
