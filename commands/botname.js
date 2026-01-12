const fs = require('fs');
const path = require('path');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363417440480101@newsletter',
            newsletterName: 'KEITH TECH',
            serverMessageId: -1
        }
    }
};

async function botnameCommand(sock, chatId, message, args, isOwner) {
    try {
        // Check if user is owner
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ *Only the bot owner can use this command!*',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if new name is provided
        if (!args || args.trim() === '') {
            const settings = require('../settings');
            await sock.sendMessage(chatId, {
                text: `📝 *Current Bot Name:* ${settings.botName}\n\n*Usage:* \`.botname <new name>\`\n*Example:* \`.botname Moon XMD V1\``,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const newBotName = args.trim();

        // Update settings.js file
        const settingsPath = path.join(__dirname, '../settings.js');
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');

        // Replace the botName value
        settingsContent = settingsContent.replace(
            /botName:\s*process\.env\.botName\s*\|\|\s*['"`].*?['"`]/,
            `botName: process.env.botName || "${newBotName}"`
        );

        fs.writeFileSync(settingsPath, settingsContent);

        // Update global variable
        global.botname = newBotName;

        // Reload settings
        delete require.cache[require.resolve('../settings')];
        const settings = require('../settings');
        settings.botName = newBotName;

        await sock.sendMessage(chatId, {
            text: `✅ *Bot name updated successfully!*\n\n*New Name:* ${newBotName}\n\n_The bot will use this name in all responses._`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in botname command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Failed to update bot name!*\n\nPlease try again or check the logs.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = botnameCommand;