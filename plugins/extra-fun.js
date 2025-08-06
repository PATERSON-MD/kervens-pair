const { lite } = require("../lite");
const config = require('../settings');

//
// Compatibility Command
//
lite({
  pattern: "compatibility",
  alias: ["friend", "fcheck"],
  desc: "Calculate the compatibility score between two users.",
  category: "fun",
  react: "💖",
  filename: __filename,
  use: "@tag1 @tag2",
}, async (conn, mek, m, { args, reply }) => {
  try {
    if (!m.mentionedJid || m.mentionedJid.length < 2) {
      return reply("Please mention two users to calculate compatibility.\nUsage: `.compatibility @user1 @user2`");
    }

    const user1 = m.mentionedJid[0];
    const user2 = m.mentionedJid[1];
    
    // Check for self-mention or same user mention
    if (user1 === user2) {
      return reply("Please mention two different users.");
    }
    
    const specialNumber = config.DEV ? `${config.DEV.replace(/[^0-9]/g, '')}@s.whatsapp.net` : null;

    let compatibilityScore = Math.floor(Math.random() * 1000) + 1;

    // Special case for the developer
    if (user1 === specialNumber || user2 === specialNumber) {
      compatibilityScore = 1000;
      await conn.sendMessage(m.chat, {
        text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: *${compatibilityScore}+/1000* 💖`,
        mentions: [user1, user2],
      }, { quoted: mek });
      return;
    }
    
    await conn.sendMessage(m.chat, {
      text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: *${compatibilityScore}/1000* 💖`,
      mentions: [user1, user2],
    }, { quoted: mek });

  } catch (error) {
    console.error("Compatibility command error:", error);
    reply(`❌ An error occurred: ${error.message}`);
  }
});

//
// Aura Command
//
lite({
  pattern: "aura",
  desc: "Calculate aura score of a user.",
  category: "fun",
  react: "💀",
  filename: __filename,
  use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
  try {
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
      return reply("Please mention a user to calculate their aura.\nUsage: `.aura @user`");
    }

    const user = m.mentionedJid[0]; 
    const specialNumber = config.DEV ? `${config.DEV.replace(/[^0-9]/g, '')}@s.whatsapp.net` : null;

    let auraScore = Math.floor(Math.random() * 1000) + 1;

    // Special case for the developer
    if (user === specialNumber) {
      auraScore = 999999; 
      await conn.sendMessage(m.chat, {
        text: `💀 Aura of @${user.split('@')[0]}: *${auraScore}+* 🗿`,
        mentions: [user],
      }, { quoted: mek });
      return;
    }
    
    await conn.sendMessage(m.chat, {
      text: `💀 Aura of @${user.split('@')[0]}: *${auraScore}/1000* 🗿`,
      mentions: [user],
    }, { quoted: mek });

  } catch (error) {
    console.error("Aura command error:", error);
    reply(`❌ An error occurred: ${error.message}`);
  }
});

//
// Roast Command
//
lite({
    pattern: "roast",
    desc: "Roast someone ",
    category: "fun",
    react: "🔥",
    filename: __filename,
    use: "@tag"
}, async (conn, mek, m, { reply }) => {
    let roasts = [
    "Bro, your IQ is lower than a weak WiFi signal!",
    "Dude, your thoughts are like WhatsApp status — disappear after 24 hours!",
    "Why do you think so much? Are you a NASA scientist or what?",
    "Who even are you? Even Google can’t find your name!",
    "Is your brain running on 2G network?",
    "Stop overthinking, bro — your battery will drain fast!",
    "Your thoughts are like a cricket match — stop working when it rains!",
    "You're a VIP — Very Idiotic Person!",
    "Bro, your IQ is weaker than a WiFi signal!",
    "Your thinking is like a WhatsApp status — gone in 24 hours!",
    "Which planet are you from? This world isn’t made for aliens like you!",
    "Your brain seems full, but there's never a result!",
    "Your life is like a WhatsApp status — can be deleted anytime!",
    "Your style is like a WiFi password — no one knows it!",
    "You’re the one who Googles their own life plot twists!",
    "You can’t even run a software update — you're completely lagging!",
    "Thinking with you is slower than a Google search on 2G!",
    "I'm not out of words, just wasn’t in the mood to roast you!",
    "Your personality is like a dead battery — time for a recharge!",
    "Your thinking deserves its own server!",
    "What game are you playing that you keep failing at?",
    "Your jokes are like software updates — keep popping up but never work!",
    "Because of you, even my phone’s storage is full!",
    "You’ve literally become a walking meme!",
    "You think you’re smart, but your brain cells are overloaded!",
    "You made us consider muting the group chat!",
    "People like you always think they’re heroes — but you're actually the villain!",
    "People like you need a rewind and fast-forward button in life!",
    "Every word from your mouth is a new bug!",
    "You couldn't save your own life, but you give advice to others!",
    "You're the biggest virus in your own life!",
    "Are you even human or just a broken app?",
    "Your thoughts need a CPU, but I think yours is dead!",
    "What are you doing — turning into a walking error message?",
    "Your compliments feel fake — everyone knows your real worth!",
    "Your brain is like a broken link — no matter how hard we search, nothing shows up!",
    "Looking at you feels like Netflix crashed because of you!",
    "Your photo is just a screenshot — in real life, you're nothing!",
    "You look like an iPhone, but inside, you're running old Android!",
    "Even Google must hate thoughts like yours!",
    "Use your face to set the mood — maybe someone will notice you!",
    "Your work is like an app that crashes when everyone needs it!",
    "The biggest hack in your life is: 'Don’t expect anything from me!'",
    "You look in the mirror and think everything’s okay!",
    "You’re operating your brain in low power mode!",
    "You have ideas — all as outdated as Windows XP!",
    "Your thinking is like a system error — needs a restart!",
    "Your personality is like an empty hard drive — nothing valuable!",
    "Which planet are you from? This world isn’t for people like you!",
    "Your face says ‘loading’ — but it never completes!",
    "Your brain is like a broken link — never connects!",
    "Even Google’s algorithm gets confused by your logic!",
    "Someone like you with such ideas? I’ve only seen that in sci-fi!",
    "You should get 'Not Found' tattooed on your face — no one finds anything from you!",
    "Your mind is so slow, even Google can’t help you!",
    "You’re a living example of ‘404 Not Found’!",
    "Your brain is like a phone battery — always drained!",
    "You're that guy who forgets his life password!",
    "What you call thinking is actually buffering!",
    "Your decisions are so confusing, even the KBC host would give up!",
    "People like you deserve a dedicated 'Error' page!",
    "Your life received a 'User Not Found' message!",
    "Your words have as much value as a 90s phone camera!",
    "You're always under construction, bro!",
    "Your life has an unknown error — no solution found!",
    "Your face should have a warning sign: ‘Caution: Too Much Stupidity Ahead!’",
    "Every time you speak, it feels like a system crash is near!",
    "You have an idea, but it's still ‘under review’!"
];
    
    const mentionedUser = m.mentionedJid[0] || (m.quoted && m.quoted.sender);

    if (!mentionedUser) {
        return reply("Please tag or reply to a user to roast them.\nUsage: `.roast @user`");
    }
    
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    const target = `@${mentionedUser.split("@")[0]}`;
    
    // Construct the message with mentions
    const message = `${target} :\n*${randomRoast}*\n> This is all for fun, don't take it seriously!`;
    
    await conn.sendMessage(m.chat, {
        text: message,
        mentions: [mentionedUser, m.sender],
    }, { quoted: mek });
});

//
// 8ball Command
//
lite({
    pattern: "8ball",
    desc: "Magic 8-Ball gives answers",
    category: "fun",
    react: "🎱",
    filename: __filename,
    use: "<question>"
}, 
async (conn, mek, m, { q, reply }) => {
    if (!q) {
        return reply("Ask a yes/no question! Example: `.8ball Will I be rich?`");
    }
    
    const responses = [
        "Yes!", "No.", "Maybe...", "Definitely!", "Not sure.", 
        "Ask again later.", "I don't think so.", "Absolutely!", 
        "No way!", "Looks promising!"
    ];
    
    const answer = responses[Math.floor(Math.random() * responses.length)];
    
    reply(`🎱 *Magic 8-Ball says:* ${answer}`);
});

//
// Compliment Command
//
lite({
    pattern: "compliment",
    desc: "Give a nice compliment",
    category: "fun",
    react: "😊",
    filename: __filename,
    use: "@tag (optional)"
}, async (conn, mek, m, { reply }) => {
    const compliments = [
        "You're amazing just the way you are! 💖",
        "You light up every room you walk into! 🌟",
        "Your smile is contagious! 😊",
        "You're a genius in your own way! 🧠",
        "You bring happiness to everyone around you! 🥰",
        "You're like a human sunshine! ☀️",
        "Your kindness makes the world a better place! ❤️",
        "You're unique and irreplaceable! ✨",
        "You're a great listener and a wonderful friend! 🤗",
        "Your positive vibes are truly inspiring! 💫",
        "You're stronger than you think! 💪",
        "Your creativity is beyond amazing! 🎨",
        "You make life more fun and interesting! 🎉",
        "Your energy is uplifting to everyone around you! 🔥",
        "You're a true leader, even if you don’t realize it! 🏆",
        "Your words have the power to make people smile! 😊",
        "You're so talented, and the world needs your skills! 🎭",
        "You're a walking masterpiece of awesomeness! 🎨",
        "You're proof that kindness still exists in the world! 💕",
        "You make even the hardest days feel a little brighter! ☀️"
    ];

    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    const mentionedUser = m.mentionedJid[0] || (m.quoted && m.quoted.sender);
    
    let message;
    let mentions = [];

    if (mentionedUser) {
        const sender = `@${m.sender.split("@")[0]}`;
        const target = `@${mentionedUser.split("@")[0]}`;
        message = `${sender} complimented ${target}:\n😊 *${randomCompliment}*`;
        mentions = [m.sender, mentionedUser];
    } else {
        const sender = `@${m.sender.split("@")[0]}`;
        message = `${sender}, you forgot to tag someone! But hey, here's a compliment for you:\n😊 *${randomCompliment}*`;
        mentions = [m.sender];
    }
    
    await conn.sendMessage(m.chat, { text: message, mentions }, { quoted: mek });
});

//
// Lovetest Command
//
lite({
    pattern: "lovetest",
    desc: "Check love compatibility between two users",
    category: "fun",
    react: "❤️",
    filename: __filename,
    use: "@tag1 @tag2"
}, async (conn, mek, m, { args, reply }) => {
    if (!m.mentionedJid || m.mentionedJid.length < 2) {
        return reply("Please tag two users! Example: `.lovetest @user1 @user2`");
    }

    const user1 = m.mentionedJid[0];
    const user2 = m.mentionedJid[1];
    
    if (user1 === user2) {
      return reply("Please tag two different users.");
    }

    const lovePercent = Math.floor(Math.random() * 100) + 1;

    const messages = [
        { range: [90, 100], text: "💖 *A match made in heaven!* True love exists!" },
        { range: [75, 89], text: "😍 *Strong connection!* This love is deep and meaningful." },
        { range: [50, 74], text: "😊 *Good compatibility!* You both can make it work." },
        { range: [30, 49], text: "🤔 *It’s complicated!* Needs effort, but possible!" },
        { range: [10, 29], text: "😅 *Not the best match!* Maybe try being just friends?" },
        { range: [1, 9], text: "💔 *Uh-oh!* This love is as real as a Bollywood breakup!" }
    ];

    const loveMessage = messages.find(msg => lovePercent >= msg.range[0] && lovePercent <= msg.range[1]).text;

    const message = `💘 *Love Compatibility Test* 💘\n\n❤️ *@${user1.split("@")[0]}* + *@${user2.split("@")[0]}* = *${lovePercent}%*\n${loveMessage}`;

    await conn.sendMessage(m.chat, { text: message, mentions: [user1, user2] }, { quoted: mek });
});

//
// Emoji Command
//
lite({
    pattern: "emoji",
    desc: "Convert text into emoji form.",
    category: "fun",
    react: "🙂",
    filename: __filename,
    use: "<text>"
},
async (conn, mek, m, { q, reply }) => {
    if (!q) {
        return reply("Please provide some text to convert into emojis! Example: `.emoji hello world`");
    }
    
    try {
        const emojiMapping = {
            "a": "🅰️", "b": "🅱️", "c": "🇨️", "d": "🇩️", "e": "🇪️", "f": "🇫️", "g": "🇬️",
            "h": "🇭️", "i": "🇮️", "j": "🇯️", "k": "🇰️", "l": "🇱️", "m": "🇲️", "n": "🇳️",
            "o": "🅾️", "p": "🇵️", "q": "🇶️", "r": "🇷️", "s": "🇸️", "t": "🇹️", "u": "🇺️",
            "v": "🇻️", "w": "🇼️", "x": "🇽️", "y": "🇾️", "z": "🇿️",
            "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣",
            "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣",
            " ": "   ", // three spaces for better readability
        };

        const emojiText = q.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

        await conn.sendMessage(m.chat, {
            text: emojiText,
        }, { quoted: mek });

    } catch (error) {
        console.error("Emoji command error:", error);
        reply(`❌ An error occurred: ${error.message}`);
    }
});

//
// Action ou Vérité Command
//
lite({
    pattern: "actionouverite",
    alias: ["av", "aouv"],
    desc: "A classic game of Truth or Dare.",
    category: "fun",
    react: "🤔",
    filename: __filename,
    use: "[action | vérité]"
}, async (conn, mek, m, { q, reply }) => {
    const truths = [
        "What is the most embarrassing thing you've ever said?",
        "What is your biggest fear?",
        "What is the most shameful thing you've done?",
        "Have you ever lied about your age?",
        "What is the strangest thing you have ever eaten?",
        "Who is your favorite person in this group, and why?",
        "What is a secret you've never told anyone?",
        "When was the last time you cried and why?",
        "If you could be any animal, what would you be?",
        "What is your biggest regret?",
        "If you could have any superpower, what would it be?",
        "What's the last song you listened to?",
        "What's a bad habit you want to quit?",
        "What's your most used emoji?",
        "What's the best compliment you've ever received?"
    ];

    const dares = [
        "Send the last photo you took in this chat.",
        "Imitate a famous person for 30 seconds.",
        "Sing a song of your choice.",
        "Text your crush 'I love you' and send a screenshot (without showing the name).",
        "Dance without music for one minute.",
        "Speak in a funny voice for the next 5 minutes.",
        "Do 10 push-ups.",
        "Let the group choose your WhatsApp status for 24 hours.",
        "Tell us a joke.",
        "Write a poem about the person to your left.",
        "Pretend to be a robot for the next 3 messages.",
        "Go outside and yell, 'I love this bot!'",
        "Put an ice cube down your back."
    ];

    const arg = q.toLowerCase();

    if (arg === "vérité" || arg === "v") {
        const randomTruth = truths[Math.floor(Math.random() * truths.length)];
        await reply(`📜 *Vérité:* ${randomTruth}`);
    } else if (arg === "action" || arg === "a") {
        const randomDare = dares[Math.floor(Math.random() * dares.length)];
        await reply(`🔥 *Action:* ${randomDare}`);
    } else {
        await reply("Please specify 'action' or 'vérité'.\nExample: `.V vérité` or `.A action`");
    }
});
