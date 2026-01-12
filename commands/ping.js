const os = require('os');
const settings = require('../settings.js');
const { Vcard } = require('../lib/Keith');

async function pingCommand(sock, chatId, message) {
    try {
        // Start timer
        const start = Date.now();
        
        // Send initial "Pinging..." message
        const sentMsg = await sock.sendMessage(chatId, { 
            text: '```Pinging...```' 
        }, { quoted: message });
        
        // Calculate response time after message is sent
        const responseTime = Date.now() - start;
        
        // Format response time with proper decimals
        const formattedTime = responseTime.toFixed(3);
        
        const pinginfo = `
🔸️ *Response:* ${formattedTime} ms`.trim();

        // Edit the message to show the ping result
        await sock.sendMessage(chatId, { 
            text: pinginfo,
            edit: sentMsg.key 
        });

    } catch (error) {
        console.error('❌ Error in ping command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get response speed.' 
        }, { quoted: message });
    }
}

module.exports = pingCommand;