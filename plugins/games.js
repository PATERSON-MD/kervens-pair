const { lite } = require('../lite');
const config = require('../settings');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Dossier de stockage des données de jeux
const GAMES_DIR = path.join(__dirname, '../database/games');
if (!fs.existsSync(GAMES_DIR)) {
    fs.mkdirSync(GAMES_DIR, { recursive: true });
}

// Base de données de questions pour le quiz
const quizQuestions = [
    {
        question: "Quelle est la capitale d'Haïti?",
        options: ["Port-au-Prince", "Cap-Haïtien", "Gonaïves", "Les Cayes"],
        answer: 0
    },
    {
        question: "Qui a découvert l'Amérique?",
        options: ["Christophe Colomb", "Vasco de Gama", "Marco Polo", "Fernand de Magellan"],
        answer: 0
    },
    {
        question: "Combien de côtés a un hexagone?",
        options: ["5", "6", "7", "8"],
        answer: 1
    },
    {
        question: "Quel est l'élément chimique représenté par 'O'?",
        options: ["Or", "Osmium", "Oxygène", "Oganesson"],
        answer: 2
    },
    {
        question: "Quelle planète est connue comme la planète rouge?",
        options: ["Vénus", "Mars", "Jupiter", "Saturne"],
        answer: 1
    }
];

// Base de données d'actions et vérités
const truthQuestions = [
    "Quelle est ta plus grande peur?",
    "Quelle est la chose la plus embarrassante que tu aies faite?",
    "As-tu déjà triché à un examen?",
    "Quel est ton secret le plus sombre?",
    "As-tu déjà volé quelque chose?"
];

const dareChallenges = [
    "Envoie un message vocal en chantant une chanson de ton enfance",
    "Change ta photo de profil pendant 5 minutes",
    "Fais une imitation de quelqu'un dans ce groupe",
    "Avoue une chose que tu as toujours voulu dire à quelqu'un ici",
    "Poste un selfie avec une cuillère sur ton nez"
];

module.exports = [
    {
        pattern: "tictactoe",
        react: "❌⭕",
        alias: ["ttt", "morpion"],
        desc: "Jouer au Tic Tac Toe",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, from, sender, participants }) {
            if (!m.isGroup) return reply("❌ Ce jeu est réservé aux groupes");
            
            const gameId = `${from}_tictactoe`;
            const gamePath = path.join(GAMES_DIR, `${gameId}.json`);
            
            // Vérifier si une partie est déjà en cours
            if (fs.existsSync(gamePath)) {
                const gameData = JSON.parse(fs.readFileSync(gamePath));
                return reply(`❌ Une partie est déjà en cours entre @${gameData.players[0]} et @${gameData.players[1]}`);
            }
            
            // Sélectionner un adversaire aléatoire
            const players = participants.filter(p => !p.id.includes(config.BOT_NUMBER));
            if (players.length < 2) return reply("❌ Pas assez de joueurs dans le groupe");
            
            const player1 = sender;
            const player2 = players[Math.floor(Math.random() * players.length)].id;
            
            // Initialiser le jeu
            const gameData = {
                players: [player1, player2],
                board: Array(9).fill(null),
                currentPlayer: 0, // index du joueur actuel
                moves: 0
            };
            
            fs.writeFileSync(gamePath, JSON.stringify(gameData, null, 2));
            
            const board = renderTTTBoard(gameData.board);
            const message = `🎮 *TIC TAC TOE* 🎮\n\n@${player1.split('@')[0]} (❌) vs @${player2.split('@')[0]} (⭕)\n\n${board}\n\nC'est au tour de ❌ (@${player1.split('@')[0]})`;
            
            await conn.sendMessage(
                from,
                {
                    text: message,
                    mentions: [player1, player2]
                },
                { quoted: mek }
            );
        }
    },
    {
        pattern: "hangman",
        react: "💀",
        alias: ["pendu"],
        desc: "Jouer au pendu",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, from, sender, text }) {
            const words = ["PROGRAMMATION", "WHATSAPP", "HAITI", "BOT", "JAVASCRIPT", "PORT AU PRINCE", "CARIBBEAN", "DEVELOPPEUR"];
            const word = words[Math.floor(Math.random() * words.length)];
            const maskedWord = word.replace(/[A-Z]/g, '_');
            
            const gameData = {
                word: word,
                guessed: [],
                remaining: 6, // 6 tentatives
                masked: maskedWord,
                player: sender
            };
            
            const gamePath = path.join(GAMES_DIR, `${from}_hangman.json`);
            fs.writeFileSync(gamePath, JSON.stringify(gameData, null, 2));
            
            const hangmanArt = getHangmanArt(6);
            const message = `🎮 *PENDU* 💀\n\n${hangmanArt}\n\nMot: ${maskedWord}\n\nErreurs restantes: 6\n\nUtilise .guess [lettre] pour deviner`;
            
            reply(message);
        }
    },
    {
        pattern: "guess",
        react: "🔢",
        desc: "Deviner une lettre dans le pendu",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, from, sender, text }) {
            const gamePath = path.join(GAMES_DIR, `${from}_hangman.json`);
            if (!fs.existsSync(gamePath)) return reply("❌ Aucune partie de pendu en cours");
            
            const gameData = JSON.parse(fs.readFileSync(gamePath));
            if (gameData.player !== sender) return reply("❌ Ce n'est pas à toi de jouer");
            
            if (!text || text.length !== 1) return reply("❌ Veuillez deviner une seule lettre");
            
            const letter = text.toUpperCase();
            
            // Vérifier si la lettre a déjà été devinée
            if (gameData.guessed.includes(letter)) {
                return reply(`❌ La lettre ${letter} a déjà été essayée`);
            }
            
            gameData.guessed.push(letter);
            
            // Vérifier si la lettre est dans le mot
            if (gameData.word.includes(letter)) {
                // Mettre à jour le mot masqué
                let newMasked = '';
                for (let i = 0; i < gameData.word.length; i++) {
                    if (gameData.word[i] === letter || gameData.masked[i] !== '_') {
                        newMasked += gameData.word[i];
                    } else {
                        newMasked += '_';
                    }
                }
                gameData.masked = newMasked;
                
                // Vérifier si le joueur a gagné
                if (!gameData.masked.includes('_')) {
                    fs.unlinkSync(gamePath);
                    return reply(`🎉 Félicitations! Tu as gagné!\nLe mot était: ${gameData.word}`);
                }
            } else {
                gameData.remaining--;
                
                // Vérifier si le joueur a perdu
                if (gameData.remaining === 0) {
                    fs.unlinkSync(gamePath);
                    return reply(`💀 Perdu! Le mot était: ${gameData.word}\n${getHangmanArt(0)}`);
                }
            }
            
            // Sauvegarder l'état du jeu
            fs.writeFileSync(gamePath, JSON.stringify(gameData, null, 2));
            
            const hangmanArt = getHangmanArt(gameData.remaining);
            const message = `🎮 *PENDU* 💀\n\n${hangmanArt}\n\nMot: ${gameData.masked}\n\nLettres essayées: ${gameData.guessed.join(', ')}\n\nErreurs restantes: ${gameData.remaining}`;
            
            reply(message);
        }
    },
    {
        pattern: "quiz",
        react: "❓",
        desc: "Quiz interactif",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, from }) {
            const question = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
            const options = question.options.map((opt, i) => `${i+1}. ${opt}`).join('\n');
            
            const gameData = {
                question: question.question,
                options: question.options,
                answer: question.answer,
                timestamp: Date.now()
            };
            
            const gamePath = path.join(GAMES_DIR, `${from}_quiz.json`);
            fs.writeFileSync(gamePath, JSON.stringify(gameData, null, 2));
            
            const message = `🎮 *QUIZ* ❓\n\n${question.question}\n\n${options}\n\nRépondez avec .answer [numéro]`;
            
            reply(message);
        }
    },
    {
        pattern: "answer",
        react: "💡",
        desc: "Répondre à une question de quiz",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, from, sender, text }) {
            const gamePath = path.join(GAMES_DIR, `${from}_quiz.json`);
            if (!fs.existsSync(gamePath)) return reply("❌ Aucun quiz en cours");
            
            const gameData = JSON.parse(fs.readFileSync(gamePath));
            const answer = parseInt(text) - 1;
            
            if (isNaN(answer) || answer < 0 || answer >= gameData.options.length) {
                return reply("❌ Réponse invalide. Utilisez un numéro entre 1 et " + gameData.options.length);
            }
            
            fs.unlinkSync(gamePath);
            
            if (answer === gameData.answer) {
                reply(`✅ Bonne réponse! @${sender.split('@')[0]} a gagné!`, { mentions: [sender] });
            } else {
                reply(`❌ Mauvaise réponse! La bonne réponse était: ${gameData.options[gameData.answer]}`);
            }
        }
    },
    {
        pattern: "actionverite",
        react: "🎲",
        alias: ["truthdare", "av"],
        desc: "Action ou Vérité",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, from, sender }) {
            const choice = Math.random() > 0.5 ? "truth" : "dare";
            
            if (choice === "truth") {
                const question = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
                reply(`🎲 *ACTION OU VÉRITÉ*\n\nVÉRITÉ:\n${question}\n\nRépondez honnêtement!`);
            } else {
                const challenge = dareChallenges[Math.floor(Math.random() * dareChallenges.length)];
                reply(`🎲 *ACTION OU VÉRITÉ*\n\nACTION:\n${challenge}\n\nMontrez-nous votre preuve!`);
            }
        }
    },
    {
        pattern: "roll",
        react: "🎲",
        alias: ["dice"],
        desc: "Lancer un dé",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, text }) {
            const diceCount = parseInt(text) || 1;
            if (diceCount > 5) return reply("❌ Maximum 5 dés à la fois");
            
            const results = [];
            for (let i = 0; i < diceCount; i++) {
                results.push(Math.floor(Math.random() * 6) + 1);
            }
            
            const diceEmojis = results.map(r => {
                switch(r) {
                    case 1: return "⚀";
                    case 2: return "⚁";
                    case 3: return "⚂";
                    case 4: return "⚃";
                    case 5: return "⚄";
                    case 6: return "⚅";
                }
            });
            
            reply(`🎲 Résultat${diceCount > 1 ? 's' : ''}: ${diceEmojis.join(' ')}\nValeur${diceCount > 1 ? 's' : ''}: ${results.join(', ')}`);
        }
    },
    {
        pattern: "rps",
        react: "✂️",
        alias: ["rockpaperscissors", "pfc"],
        desc: "Pierre-Papier-Ciseaux",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, text, sender }) {
            if (!text) return reply("❌ Usage: .rps [pierre|papier|ciseaux]");
            
            const choices = ["pierre", "papier", "ciseaux"];
            const playerChoice = text.toLowerCase();
            
            if (!choices.includes(playerChoice)) {
                return reply("❌ Choix invalide. Options: pierre, papier, ciseaux");
            }
            
            const botChoice = choices[Math.floor(Math.random() * 3)];
            const playerIndex = choices.indexOf(playerChoice);
            const botIndex = choices.indexOf(botChoice);
            
            let result;
            if (playerIndex === botIndex) {
                result = "Égalité!";
            } else if (
                (playerIndex === 0 && botIndex === 2) || // Pierre > Ciseaux
                (playerIndex === 1 && botIndex === 0) || // Papier > Pierre
                (playerIndex === 2 && botIndex === 1)    // Ciseaux > Papier
            ) {
                result = `@${sender.split('@')[0]} gagne!`;
            } else {
                result = `${config.BOT_NAME} gagne!`;
            }
            
            const emojis = {
                "pierre": "🪨",
                "papier": "📄",
                "ciseaux": "✂️"
            };
            
            const message = `🎮 *PIERRE-PAPIER-CISEAUX* ✂️\n\n@${sender.split('@')[0]}: ${emojis[playerChoice]}\n${config.BOT_NAME}: ${emojis[botChoice]}\n\nRésultat: ${result}`;
            
            reply(message, { mentions: [sender] });
        }
    },
    {
        pattern: "combat",
        react: "⚔️",
        desc: "Simulateur de combat",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, from, sender, participants, text }) {
            if (!m.isGroup) return reply("❌ Ce jeu est réservé aux groupes");
            
            // Vérifier si un adversaire est mentionné
            let target;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
                target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            
            if (!target) return reply("❌ Mentionnez un adversaire");
            if (target === sender) return reply("❌ Tu ne peux pas te combattre toi-même");
            if (target === config.BOT_NUMBER) return reply("💥 Je suis trop fort pour toi!");
            
            // Attributs des joueurs
            const player1 = {
                id: sender,
                name: sender.split('@')[0],
                health: 100,
                attack: Math.floor(Math.random() * 15) + 10,
                defense: Math.floor(Math.random() * 5) + 5
            };
            
            const player2 = {
                id: target,
                name: target.split('@')[0],
                health: 100,
                attack: Math.floor(Math.random() * 15) + 10,
                defense: Math.floor(Math.random() * 5) + 5
            };
            
            // Déroulement du combat
            let log = `⚔️ *COMBAT ENTRE @${player1.name} ET @${player2.name}* ⚔️\n\n`;
            
            for (let round = 1; round <= 5; round++) {
                // Joueur 1 attaque
                const damage1 = Math.max(1, player1.attack - player2.defense);
                player2.health -= damage1;
                
                log += `Round ${round}:\n@${player1.name} attaque et inflige ${damage1} dégâts!\n`;
                
                // Vérifier si le joueur 2 est KO
                if (player2.health <= 0) {
                    player2.health = 0;
                    log += `💥 @${player2.name} est KO!\n@${player1.name} remporte la victoire! 🏆`;
                    break;
                }
                
                // Joueur 2 attaque
                const damage2 = Math.max(1, player2.attack - player1.defense);
                player1.health -= damage2;
                
                log += `@${player2.name} contre-attaque et inflige ${damage2} dégâts!\n`;
                
                // Vérifier si le joueur 1 est KO
                if (player1.health <= 0) {
                    player1.health = 0;
                    log += `💥 @${player1.name} est KO!\n@${player2.name} remporte la victoire! 🏆`;
                    break;
                }
                
                // Statut à la fin du round
                log += `Santé: @${player1.name} - ${player1.health}% | @${player2.name} - ${player2.health}%\n\n`;
                
                // Fin du combat sans KO
                if (round === 5) {
                    if (player1.health > player2.health) {
                        log += `🏆 @${player1.name} gagne par décision!`;
                    } else if (player2.health > player1.health) {
                        log += `🏆 @${player2.name} gagne par décision!`;
                    } else {
                        log += "Match nul!";
                    }
                }
            }
            
            reply(log, { mentions: [player1.id, player2.id] });
        }
    },
    {
        pattern: "casino",
        react: "🎰",
        desc: "Jeu de casino (Pari simple)",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply, sender, text }) {
            const [betAmount, choice] = text.split(' ');
            if (!betAmount || !choice) {
                return reply("❌ Usage: .casino [montant] [1-2]\nEx: .casino 100 1");
            }
            
            const amount = parseInt(betAmount);
            if (isNaN(amount) return reply("❌ Montant invalide");
            
            // Vérifier si l'utilisateur a assez de points
            // (Cette partie nécessiterait un système de points/économie)
            
            const playerChoice = parseInt(choice);
            if (playerChoice !== 1 && playerChoice !== 2) {
                return reply("❌ Choix invalide. Choisissez 1 ou 2");
            }
            
            // Générer un résultat aléatoire
            const result = Math.floor(Math.random() * 2) + 1;
            const win = playerChoice === result;
            
            // Calculer le gain (pari x2 en cas de victoire)
            const winnings = win ? amount * 2 : 0;
            
            const message = `🎰 *CASINO* 🎰\n\n` +
                            `Vous avez parié: ${amount} points sur le ${playerChoice}\n` +
                            `Résultat: ${result}\n\n` +
                            (win ? 
                                `🎉 Vous gagnez ${winnings} points!` : 
                                `❌ Vous perdez votre mise. Essayez encore!`);
            
            reply(message);
        }
    },
    {
        pattern: "trivia",
        react: "🧠",
        desc: "Question de culture générale",
        category: "game",
        filename: __filename,
        async handler(conn, mek, m, { reply }) {
            try {
                const { data } = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
                if (data.results.length === 0) return reply("❌ Aucune question disponible");
                
                const question = data.results[0];
                const options = [...question.incorrect_answers, question.correct_answer]
                    .sort(() => Math.random() - 0.5);
                
                const answerIndex = options.indexOf(question.correct_answer);
                
                const gameData = {
                    question: question.question,
                    options: options,
                    answer: answerIndex,
                    category: question.category,
                    difficulty: question.difficulty,
                    timestamp: Date.now()
                };
                
                const gamePath = path.join(GAMES_DIR, `trivia_${Date.now()}.json`);
                fs.writeFileSync(gamePath, JSON.stringify(gameData, null, 2));
                
                const optionsText = options.map((opt, i) => `${i+1}. ${opt}`).join('\n');
                const message = `🧠 *TRIVIA: ${
