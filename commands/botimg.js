const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

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

async function botimgCommand(sock, chatId, message, isOwner) {
    try {
        // Check if user is owner
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ *Only the bot owner can use this command!*',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Check if message has an image
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = message.message?.imageMessage || quotedMessage?.imageMessage;

        if (!imageMessage) {
            await sock.sendMessage(chatId, {
                text: '❌ *Please reply to an image or send an image with the command!*\n\n*Usage:* Reply to an image with `.botimg`',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, {
            text: '⏳ *Updating bot image...*',
            ...channelInfo
        }, { quoted: message });

        // Download the image
        const buffer = await downloadMediaMessage(
            quotedMessage ? { message: quotedMessage } : message,
            'buffer',
            {}
        );

        // Save the image
        const imgPath = path.join(__dirname, '../assets/Menu.jpg');
        
        // Create assets directory if it doesn't exist
        if (!fs.existsSync(path.join(__dirname, '../assets'))) {
            fs.mkdirSync(path.join(__dirname, '../assets'), { recursive: true });
        }

        fs.writeFileSync(imgPath, buffer);

        await sock.sendMessage(chatId, {
            text: '✅ *Bot image updated successfully!*\n\nThe new image will be used in the alive command and other bot responses.',
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in botimg command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Failed to update bot image!*\n\nPlease make sure you replied to a valid image.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = botimgCommand;