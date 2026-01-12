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

async function blockCommand(sock, chatId, message, args, isOwner) {
    try {
        // Check if user is owner
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ *Only the bot owner can use this command!*',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        let targetJid = null;

        // Check if replying to a message
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

        if (quotedParticipant) {
            targetJid = quotedParticipant;
        }
        // Check if number is provided
        else if (args && args.trim() !== '') {
            let number = args.trim().replace(/[^0-9]/g, '');
            
            // Add country code if not present
            if (!number.startsWith('263') && !number.startsWith('+')) {
                number = '263' + number;
            }
            
            targetJid = number + '@s.whatsapp.net';
        }
        // Check if mentioned
        else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Block in private chat
        else if (!chatId.endsWith('@g.us')) {
            targetJid = chatId;
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ *Please specify who to block!*\n\n*Usage:*\n• Reply to a message with `.block`\n• Use `.block @mention`\n• Use `.block 263xxxxxxxxx`\n• Use `.block` in private chat',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Don't block yourself
        if (targetJid === sock.user.id) {
            await sock.sendMessage(chatId, {
                text: '❌ *Cannot block the bot itself!*',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get user name
        let userName = 'User';
        try {
            userName = await sock.getName(targetJid);
        } catch (e) {
            userName = targetJid.split('@')[0];
        }

        // Block the user
        await sock.updateBlockStatus(targetJid, 'block');

        await sock.sendMessage(chatId, {
            text: `🚫 *User Blocked Successfully!*\n\n👤 *User:* ${userName}\n📱 *Number:* ${targetJid.split('@')[0]}\n\nThis user is now blocked and cannot interact with the bot.`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in block command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Failed to block user!*\n\nPlease try again or check the logs.',
            ...channelInfo
        }, { quoted: message });
    }
}

async function unblockCommand(sock, chatId, message, args, isOwner) {
    try {
        // Check if user is owner
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ *Only the bot owner can use this command!*',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        let targetJid = null;

        // Check if replying to a message
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

        if (quotedParticipant) {
            targetJid = quotedParticipant;
        }
        // Check if number is provided
        else if (args && args.trim() !== '') {
            let number = args.trim().replace(/[^0-9]/g, '');
            
            // Add country code if not present
            if (!number.startsWith('263') && !number.startsWith('+')) {
                number = '263' + number;
            }
            
            targetJid = number + '@s.whatsapp.net';
        }
        // Check if mentioned
        else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Unblock in private chat
        else if (!chatId.endsWith('@g.us')) {
            targetJid = chatId;
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ *Please specify who to unblock!*\n\n*Usage:*\n• Reply to a message with `.unblock`\n• Use `.unblock @mention`\n• Use `.unblock 263xxxxxxxxx`\n• Use `.unblock` in private chat',
                ...channelInfo
            }, { quoted: message });
            return;
        }

        // Get user name
        let userName = 'User';
        try {
            userName = await sock.getName(targetJid);
        } catch (e) {
            userName = targetJid.split('@')[0];
        }

        // Unblock the user
        await sock.updateBlockStatus(targetJid, 'unblock');

        await sock.sendMessage(chatId, {
            text: `✅ *User Unblocked Successfully!*\n\n👤 *User:* ${userName}\n📱 *Number:* ${targetJid.split('@')[0]}\n\nThis user can now interact with the bot again.`,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in unblock command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Failed to unblock user!*\n\nPlease try again or check the logs.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = { blockCommand, unblockCommand };