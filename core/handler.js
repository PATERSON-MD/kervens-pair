// plugins/💬️/core/handler.js
const CommandLoader = require('./loader');
const config = require('../settings');

class CommandHandler {
    constructor() {
        this.loader = new CommandLoader(path.join(__dirname, '../commands'));
    }

    async initialize() {
        this.loader.loadCommands();
    }

    async execute(message) {
        const prefix = config.core.prefix;
        if (!message.body.startsWith(prefix)) return false;

        const args = message.body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = this.loader.getCommand(commandName);
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
