// plugins/💬️/core/handler.js
const path = require('path');
const fs = require('fs');
const config = require('../settings');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandsPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            this.commands.set(command.name, command);
            
            if (command.aliases) {
                command.aliases.forEach(alias => {
                    this.aliases.set(alias, command.name);
                });
            }
        }
        console.log(`✅ Chargé ${this.commands.size} commandes avec ${this.aliases.size} alias`);
    }

    async execute(message) {
        const prefix = config.core.prefix;
        if (!message.body.startsWith(prefix)) return false;

        const args = message.body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = this.commands.get(commandName) || 
                        this.commands.get(this.aliases.get(commandName));

        if (!command) return false;

        try {
            await command.execute(message, args);
            return true;
        } catch (error) {
            console.error(`❌ Erreur dans ${commandName}:`, error);
            message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande');
            return false;
        }
    }
}

module.exports = new CommandHandler();
