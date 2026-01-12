/*
CODES BY KEITH TECH

*/

const { handleGoodbye } = require('../lib/welcome');
const { isGoodByeOn, getGoodbye } = require('../lib/index');
const fetch = require('node-fetch');

async function goodbyeCommand(sock, chatId, message, match) {
    // Check if it's a group
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { text: 'This command can only be used in groups.' });
        return;
    }

    // Extract match from message
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    await handleGoodbye(sock, chatId, message, matchText);
}

async function handleLeaveEvent(sock, id, participants) {
    // Check if goodbye is enabled for this group
    const isGoodbyeEnabled = await isGoodByeOn(id);
    if (!isGoodbyeEnabled) return;

    // Get custom goodbye message
    const customMessage = await getGoodbye(id);

    // Get group metadata
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;

    // Send goodbye message for each leaving participant
    for (const participant of participants) {
        try {
            // Handle case where participant might be an object or not a string
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            // Get user's display name
            let displayName = user; // Default to phone number
            try {
                const contact = await sock.getBusinessProfile(participantString);
                if (contact && contact.name) {
                    displayName = contact.name;
                } else {
                    // Try to get from group participants
                    const groupParticipants = groupMetadata.participants;
                    const userParticipant = groupParticipants.find(p => p.id === participantString);
                    if (userParticipant && userParticipant.name) {
                        displayName = userParticipant.name;
                    }
                }
            } catch (nameError) {
                console.log('Could not fetch display name, using phone number');
            }
            
            // Get user profile picture
            let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`; // Default avatar
            try {
                const profilePic = await sock.profilePictureUrl(participantString, 'image');
                if (profilePic) {
                    profilePicUrl = profilePic;
                }
            } catch (profileError) {
                console.log('Could not fetch profile picture, using default');
            }
            
            // Process custom message with variables
            let finalMessage;
            if (customMessage) {
                finalMessage = customMessage
                    .replace(/{user}/g, `@${displayName}`)
                    .replace(/{group}/g, groupName);
            } else {
                // Default message with sad emoji and "we lost our soldier"
                const now = new Date();
                const timeString = now.toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                
                finalMessage = `
 ╭━━━≪•🥀•≫━━━╮
┃ 𝐖𝐄 𝐋𝐎𝐒𝐓 𝐎𝐔𝐑 𝐒𝐎𝐋𝐃𝐈𝐄𝐑 😢
╰━━━━━━━━━━━━╯

👤 *@${displayName}*
📉 Members: ${groupMetadata.participants.length}
⏰ Time: ${timeString}

💔 *We will miss you @${displayName}* 

_Goodbye from *${groupName}*_

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴇɪᴛʜ ᴛᴇᴄʜ`;
            }
            
            // Try to send with profile picture
            try {
                // Fetch the profile picture
                const response = await fetch(profilePicUrl);
                if (response.ok) {
                    const imageBuffer = await response.buffer();
                    
                    // Send goodbye with profile picture and caption
                    await sock.sendMessage(id, {
                        image: imageBuffer,
                        caption: finalMessage,
                        mentions: [participantString]
                    });
                    continue; // Skip to next participant
                }
            } catch (imageError) {
                console.log('Profile picture fetch failed, falling back to text');
            }
            
            // Fallback: Send text message only
            await sock.sendMessage(id, {
                text: finalMessage,
                mentions: [participantString]
            });
        } catch (error) {
            console.error('Error sending goodbye message:', error);
            // Final fallback to simple text message
            const participantString = typeof participant === 'string' ? participant : (participant.id || participant.toString());
            const user = participantString.split('@')[0];
            
            // Use custom message if available, otherwise use simple fallback
            let fallbackMessage;
            if (customMessage) {
                fallbackMessage = customMessage
                    .replace(/{user}/g, `@${user}`)
                    .replace(/{group}/g, groupName);
            } else {
                fallbackMessage = `😢 *We lost our soldier*\n\n💔 We will miss you @${user}\n\nGoodbye from *${groupName}* 👋`;
            }
            
            await sock.sendMessage(id, {
                text: fallbackMessage,
                mentions: [participantString]
            });
        }
    }
}

module.exports = { goodbyeCommand, handleLeaveEvent };