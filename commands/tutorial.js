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

async function tutorialCommand(sock, chatId, message) {
    try {
        const tutorialText = `

*📚 DEPLOYMENT GUIDES:*

*1️⃣ HEROKU DEPLOYMENT*
*coming soon...*

*2️⃣ RAILWAY DEPLOYMENT*
*coming soon...*

*3️⃣ RENDER DEPLOYMENT*
*coming soon...*

*4️⃣ KOYEB DEPLOYMENT*
*coming soon...*

*5️⃣ PANEL/VPS DEPLOYMENT*
*coming soon...*

*6️⃣ TERMUX DEPLOYMENT*
*coming soon...*

━━━━━━━━━━━━━━━━━━━━

*🔧 GETTING SESSION ID:*
*coming soon...*

*📖 DOCUMENTATION:*
🔗 https://github.com/mrkeithtech/Moon-Xmd
_Complete documentation and guides_

*💬 SUPPORT GROUP:*
🔗 https://chat.whatsapp.com/Ir5dLLFsZVaEXklBsYeHSe
_Join for help and support_

*📢 CHANNEL:*
🔗 https://whatsapp.com/channel/0029VbANWX1DuMRi1VNPlB0y
_Stay updated with latest features_

━━━━━━━━━━━━━━━━━━━━

*🎯 QUICK TIPS:*

• Always use the latest version
• Keep your session ID private
• Use environment variables
• Join support group for help
• Check documentation first

━━━━━━━━━━━━━━━━━━━━

*🌟 FEATURES:*

✅ Multi-device support
✅ Auto-reply & Auto-reaction
✅ Advanced moderation
✅ Download from 20+ platforms
✅ AI image generation
✅ Games & Entertainment
✅ Group management tools
✅ And much more!

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴏᴏɴ xᴍᴅ
> © ᴋᴇɪᴛʜ ᴛᴇᴄʜ`;

        await sock.sendMessage(chatId, {
            text: tutorialText,
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in tutorial command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Failed to load tutorial!*\n\nPlease try again later.',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = tutorialCommand;