const settings = require('../settings');

async function channelInfoCommand(sock, chatId, message, userMessage) {
    try {
        const url = userMessage.slice(4).trim(); // Remove '.cid ' from command

        if (!url) {
            await sock.sendMessage(chatId, {
                text: "❎ Please provide a WhatsApp Channel link.\n\n*Example:* .cid https://whatsapp.com/channel/123456789"
            }, { quoted: message });
            return;
        }

        const match = url.match(/whatsapp\.com\/channel\/([\w-]+)/);
        if (!match) {
            await sock.sendMessage(chatId, {
                text: "⚠️ *Invalid channel link format.*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx"
            }, { quoted: message });
            return;
        }

        const inviteId = match[1];

        let metadata;
        try {
            metadata = await sock.newsletterMetadata("invite", inviteId);
        } catch (e) {
            await sock.sendMessage(chatId, {
                text: "❌ Failed to fetch channel metadata. Make sure the link is correct."
            }, { quoted: message });
            return;
        }

        if (!metadata || !metadata.id) {
            await sock.sendMessage(chatId, {
                text: "❌ Channel not found or inaccessible."
            }, { quoted: message });
            return;
        }

        const infoText = `*— 乂 Channel Info —*\n\n` +
            `🆔 *ID:* ${metadata.id}\n` +
            `📌 *Name:* ${metadata.name}\n` +
            `👥 *Followers:* ${metadata.subscribers?.toLocaleString() || "N/A"}\n` +
            `📅 *Created on:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString("en-US") : "Unknown"}`;

        if (metadata.preview) {
            await sock.sendMessage(chatId, {
                image: { url: `https://pps.whatsapp.net${metadata.preview}` },
                caption: infoText
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text: infoText
            }, { quoted: message });
        }

    } catch (error) {
        console.error("❌ Error in .cid command:", error);
        await sock.sendMessage(chatId, {
            text: "⚠️ An unexpected error occurred."
        }, { quoted: message });
    }
}

module.exports = channelInfoCommand;