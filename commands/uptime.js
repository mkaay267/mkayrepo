/*

CODES BY KEITH

*/

const os = require('os');
const { getUptime } = require('../lib/runtime');

async function uptimeCommand(sock, chatId, message) {
    try {
        
        const uptime = getUptime();
        
        const upinfo = `
🔸️ *Uptime:* ${uptime} ms`.trim();

        await sock.sendMessage(chatId, { 
            text: upinfo
        });

    } catch (error) {
        console.error('❌ Error in uptime command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get Uptime.' 
        }, { quoted: message });
    }
}

module.exports = uptimeCommand;