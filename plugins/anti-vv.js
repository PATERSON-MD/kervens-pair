const { lite } = require("../lite");

lite({
  pattern: "vv",
  alias: ["viewonce", 'retrive'],
  react: '🐳',
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    if (!isCreator) {
      return await client.sendMessage(from, { text: "*📛 This is an owner command.*" }, { quoted: message });
    }

    if (!message.quoted) {
      return await client.sendMessage(from, { text: "*🍁 Please reply to a view once message!*" }, { quoted: message });
    }

    const quotedMessage = message.quoted;
    
    // Check if the quoted message is a view once type
    if (quotedMessage.mtype !== 'viewOnceMessageV2') {
        return await client.sendMessage(from, { text: "*🍁 Please reply to a view once message!*" }, { quoted: message });
    }

    const viewOnceContent = quotedMessage.message.viewOnceMessageV2.message;
    const mtype = Object.keys(viewOnceContent)[0]; // Get the actual message type inside viewOnceMessageV2

    const buffer = await client.downloadMediaMessage(quotedMessage);
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: viewOnceContent.imageMessage.caption || '',
          mimetype: viewOnceContent.imageMessage.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: viewOnceContent.videoMessage.caption || '',
          mimetype: viewOnceContent.videoMessage.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: viewOnceContent.audioMessage.ptt || false
        };
        break;
      default:
        return await client.sendMessage(from, { text: "❌ Only image, video, and audio messages are supported for retrieval." }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, { text: "❌ Error fetching view once message:\n" + error.message }, { quoted: message });
  }
});
