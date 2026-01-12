const axios = require("axios");

async function tinyCommand(sock, chatId, message, userMessage) {
    try {
        const link = userMessage.slice(5).trim();
        if (!link) {
            await sock.sendMessage(chatId, {
                text: "*ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴍᴇ ᴀ ʟɪɴᴋ.*"
            }, { quoted: message });
            return;
        }

        console.log("URL to shorten:", link);
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${link}`);
        const shortenedUrl = response.data;

        console.log("Shortened URL:", shortenedUrl);
        await sock.sendMessage(chatId, {
            text: `*YOUR SHORTENED URL*\n\n${shortenedUrl}`
        }, { quoted: message });

    } catch (e) {
        console.error("Error shortening URL:", e);
        await sock.sendMessage(chatId, {
            text: "An error occurred while shortening the URL. Please try again."
        }, { quoted: message });
    }
}

module.exports = tinyCommand;