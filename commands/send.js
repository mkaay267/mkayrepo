const settings = require('../settings');

async function sendCommand(sock, chatId, message) {
    try {
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quotedMsg) {
            await sock.sendMessage(chatId, {
                text: "*🍁 Please reply to a message!*"
            }, { quoted: message });
            return;
        }

        let messageContent = {};

        if (quotedMsg.imageMessage) {
            const buffer = await sock.downloadMediaMessage({
                key: {
                    remoteJid: chatId,
                    id: message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: message.message.extendedTextMessage.contextInfo.participant
                },
                message: quotedMsg
            });

            messageContent = {
                image: buffer,
                caption: quotedMsg.imageMessage.caption || '',
                mimetype: quotedMsg.imageMessage.mimetype || "image/jpeg"
            };
        } else if (quotedMsg.videoMessage) {
            const buffer = await sock.downloadMediaMessage({
                key: {
                    remoteJid: chatId,
                    id: message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: message.message.extendedTextMessage.contextInfo.participant
                },
                message: quotedMsg
            });

            messageContent = {
                video: buffer,
                caption: quotedMsg.videoMessage.caption || '',
                mimetype: quotedMsg.videoMessage.mimetype || "video/mp4"
            };
        } else if (quotedMsg.audioMessage) {
            const buffer = await sock.downloadMediaMessage({
                key: {
                    remoteJid: chatId,
                    id: message.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: message.message.extendedTextMessage.contextInfo.participant
                },
                message: quotedMsg
            });

            messageContent = {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: quotedMsg.audioMessage.ptt || false
            };
        } else {
            await sock.sendMessage(chatId, {
                text: "❌ Only image, video, and audio messages are supported"
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(chatId, messageContent, { quoted: message });

    } catch (error) {
        console.error("Forward Error:", error);
        await sock.sendMessage(chatId, {
            text: "❌ Error forwarding message:\n" + error.message
        }, { quoted: message });
    }
}

module.exports = sendCommand;