/*
 K E I T H   T E C H
 
- Owner: Keith 
- Github: https://github.com/mrkeithtech/
- Telegram: https://t.me/mrkeithtech

*/

const fs = require('fs');
const path = require('path');

const ANTIEDIT_FILE = path.join(__dirname, '../data/antiedit.json');
const MESSAGE_STORE_FILE = path.join(__dirname, '../data/messageStore.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

// Initialize antiedit settings file
function initAntieditSettings() {
    if (!fs.existsSync(ANTIEDIT_FILE)) {
        const defaultSettings = {
            enabled: true,
            mode: "private" // public or private
        };
        fs.writeFileSync(ANTIEDIT_FILE, JSON.stringify(defaultSettings, null, 2));
    }
}

// Initialize message store
function initMessageStore() {
    if (!fs.existsSync(MESSAGE_STORE_FILE)) {
        fs.writeFileSync(MESSAGE_STORE_FILE, JSON.stringify({}, null, 2));
    }
}

// Read antiedit settings
function readAntieditSettings() {
    initAntieditSettings();
    try {
        return JSON.parse(fs.readFileSync(ANTIEDIT_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading antiedit settings:', error);
        return { enabled: false, mode: "public" };
    }
}

// Write antiedit settings
function writeAntieditSettings(settings) {
    try {
        fs.writeFileSync(ANTIEDIT_FILE, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing antiedit settings:', error);
        return false;
    }
}

// Check if antiedit is enabled
function isAntieditEnabled() {
    const settings = readAntieditSettings();
    return settings.enabled === true;
}

// Get antiedit mode
function getAntieditMode() {
    const settings = readAntieditSettings();
    return settings.mode || "public";
}

// Store original message
function storeOriginalMessage(message) {
    if (!isAntieditEnabled()) return;
    
    initMessageStore();
    
    try {
        const messageStore = JSON.parse(fs.readFileSync(MESSAGE_STORE_FILE, 'utf8'));
        
        const messageId = message.key.id;
        const chatId = message.key.remoteJid;
        
        // Extract message content
        let messageContent = '';
        if (message.message?.conversation) {
            messageContent = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            messageContent = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage?.caption) {
            messageContent = message.message.imageMessage.caption;
        } else if (message.message?.videoMessage?.caption) {
            messageContent = message.message.videoMessage.caption;
        }
        
        if (messageContent) {
            if (!messageStore[chatId]) {
                messageStore[chatId] = {};
            }
            
            messageStore[chatId][messageId] = {
                content: messageContent,
                sender: message.key.participant || message.key.remoteJid,
                timestamp: Date.now()
            };
            
            // Keep only last 100 messages per chat to save space
            const messages = Object.keys(messageStore[chatId]);
            if (messages.length > 100) {
                const oldestMessages = messages.slice(0, messages.length - 100);
                oldestMessages.forEach(id => delete messageStore[chatId][id]);
            }
            
            fs.writeFileSync(MESSAGE_STORE_FILE, JSON.stringify(messageStore, null, 2));
        }
    } catch (error) {
        console.error('Error storing original message:', error);
    }
}

// Get original message
function getOriginalMessage(chatId, messageId) {
    initMessageStore();
    
    try {
        const messageStore = JSON.parse(fs.readFileSync(MESSAGE_STORE_FILE, 'utf8'));
        return messageStore[chatId]?.[messageId] || null;
    } catch (error) {
        console.error('Error getting original message:', error);
        return null;
    }
}

// Clean old messages (older than 24 hours)
function cleanOldMessages() {
    initMessageStore();
    
    try {
        const messageStore = JSON.parse(fs.readFileSync(MESSAGE_STORE_FILE, 'utf8'));
        const now = Date.now();
        const DAY_MS = 24 * 60 * 60 * 1000;
        
        for (const chatId in messageStore) {
            for (const messageId in messageStore[chatId]) {
                if (now - messageStore[chatId][messageId].timestamp > DAY_MS) {
                    delete messageStore[chatId][messageId];
                }
            }
            
            // Remove empty chat entries
            if (Object.keys(messageStore[chatId]).length === 0) {
                delete messageStore[chatId];
            }
        }
        
        fs.writeFileSync(MESSAGE_STORE_FILE, JSON.stringify(messageStore, null, 2));
    } catch (error) {
        console.error('Error cleaning old messages:', error);
    }
}

// Clean old messages every 6 hours
setInterval(cleanOldMessages, 6 * 60 * 60 * 1000);

module.exports = {
    isAntieditEnabled,
    getAntieditMode,
    readAntieditSettings,
    writeAntieditSettings,
    storeOriginalMessage,
    getOriginalMessage
};