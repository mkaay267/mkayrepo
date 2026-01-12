const path = require('path');
const fs = require('fs');
const settings = require("../settings");
const { getUptime } = require('../lib/runtime');

function getPushname(message) {
    return message.pushName || message.key.participant?.split('@')[0] || 'No Name';
}

async function aliveCommand(sock, chatId, message) {
    try {
        const imgPath = path.join(__dirname, '../assets/Repo-img.jpg');
        const imgBuffer = fs.readFileSync(imgPath);
        const uptime = getUptime();
        const pushname = getPushname(message);
        
        await sock.sendMessage(chatId, {
            react: { text: '❄', key: message.key }
        });
        
        const caption = `
\n     ☆ \`${settings.botName}\` ☆

 *ʜɪ 👋* @${pushname}

 *🔋 uᴘᴛɪᴍᴇ:* ${uptime}
 
 *⚡ vᴇʀꜱɪᴏɴ:* 1.0.0

 \`sᴛᴀᴛᴜꜱ\`: *MOON-XMD is online! 🚀*


🔗 https://github.com/mrkeithtech/Moon-Xmd

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴏᴏɴ xᴍᴅ`;
        
        // Send the message with image
        await sock.sendMessage(chatId, {
            image: imgBuffer,
            caption: caption,
            mentions: [message.key.participant || message.key.remoteJid]
        });
      
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: '> 🌙 MOON XMD is alive and running!' }, { quoted: message });
    }
}

module.exports = aliveCommand;