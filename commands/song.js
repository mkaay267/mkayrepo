const axios = require('axios');
const yts = require('yt-search');

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
};

// Store user sessions (optional, for tracking)
const userSessions = new Map();

async function tryRequest(getter, attempts = 3) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter();
        } catch (err) {
            lastError = err;
            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

async function getIzumiDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=mp3`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.download) return res.data.result;
    throw new Error('Izumi youtube?url returned no download');
}

async function getIzumiDownloadByQuery(query) {
    const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube-play?query=${encodeURIComponent(query)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.result?.download) return res.data.result;
    throw new Error('Izumi youtube-play returned no download');
}

async function getOkatsuDownloadByUrl(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
    if (res?.data?.dl) {
        return {
            download: res.data.dl,
            title: res.data.title,
            thumbnail: res.data.thumb
        };
    }
    throw new Error('Okatsu ytmp3 returned no download');
}

// Function to send reaction
async function sendReaction(sock, chatId, message, emoji) {
    try {
        const reactionMessage = {
            react: {
                text: emoji,
                key: {
                    remoteJid: chatId,
                    id: message.key.id,
                    participant: message.key.participant || message.key.remoteJid
                }
            }
        };
        await sock.sendMessage(chatId, reactionMessage);
    } catch (error) {
        console.error('Error sending reaction:', error);
    }
}

async function songCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || '';
        
        // Remove command prefix if present
        const cleanText = text.replace(/^\.(song|play)\s*/i, '').trim();
        
        // Send initial reaction
        await sendReaction(sock, chatId, message, '🎵');
        
        // Check if empty
        if (!cleanText) {
            await sendReaction(sock, chatId, message, '❓');
            await sock.sendMessage(chatId, { 
                text: '*🎵 Moon XMD Music Dl 🎵*\n\n*Usage:*\n\`.play <song name>\`\n\`.play <youtube link>\`\n\n*Example:*\n\`.play shape of you\`\n\`.play https://youtu.be/JGwWNGJdvx8\`' 
            }, { quoted: message });
            return;
        }

        // Send searching reaction
        await sendReaction(sock, chatId, message, '🔍');
        
        // Send searching message
        const searchingMsg = await sock.sendMessage(chatId, { 
            text: `*🔍 Searching for:* \`${cleanText}\`\n⏳ Please wait while I find the best audio...` 
        }, { quoted: message });

        let video;
        if (cleanText.includes('youtube.com') || cleanText.includes('youtu.be')) {
            // For direct YouTube links
            video = { 
                url: cleanText,
                title: 'YouTube Audio',
                thumbnail: 'https://i.ytimg.com/vi/default.jpg',
                timestamp: '0:00'
            };
        } else {
            // Search for song
            const search = await yts(cleanText);
            if (!search || !search.videos.length) {
                await sendReaction(sock, chatId, message, '❌');
                await sock.sendMessage(chatId, { 
                    text: '*❌ No results found!*\nPlease try a different song name or check your spelling.' 
                }, { quoted: message });
                return;
            }
            video = search.videos[0];
        }

        // Send processing reaction
        await sendReaction(sock, chatId, message, '⏳');
        
        // Update message
        await sock.sendMessage(chatId, { 
            text: `*✅ Found: ${video.title}*\n 📥 Downloading...\n*🔄 Please wait...*` 
        }, { quoted: message });

        // Download audio
        let audioData;
        try {
            if (video.url && (video.url.includes('youtube.com') || video.url.includes('youtu.be'))) {
                audioData = await getIzumiDownloadByUrl(video.url);
            } else {
                const query = video.title || cleanText;
                audioData = await getIzumiDownloadByQuery(query);
            }
        } catch (e1) {
            try {
                if (video.url) {
                    audioData = await getOkatsuDownloadByUrl(video.url);
                } else {
                    throw new Error('No valid URL found');
                }
            } catch (e2) {
                await sendReaction(sock, chatId, message, '❌');
                await sock.sendMessage(chatId, { 
                    text: '*❌ Download failed!*\nAll MP3 download services are currently unavailable.\nPlease try again later.' 
                }, { quoted: message });
                return;
            }
        }

        // Calculate duration in seconds
        let durationSeconds = 0;
        if (video.timestamp) {
            const parts = video.timestamp.split(':').map(Number);
            if (parts.length === 3) {
                durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else if (parts.length === 2) {
                durationSeconds = parts[0] * 60 + parts[1];
            }
        } else if (video.duration) {
            durationSeconds = video.duration.seconds || 0;
        }

        // Send the menu first (without reply functionality)
        const menuMessage = await sock.sendMessage(chatId, {
            image: { url: video.thumbnail || 'https://i.ibb.co/5vJ5Y5J/music-default.jpg' },
            caption: `*🎵 Moon X𝐌𝙳  𝐌𝐏𝟑 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 🎵*
*┏━━━━━━━━━━━➤*
*➤ 🗒️𝐓itle:* ${video.title}
*➤ ⏱️𝐃uration:* ${video.timestamp || `${durationSeconds} seconds`}
*➤ 🔊𝐅ormat:* MP3 Audio

*┗━━━━━━━━━━━━➤*

> *𝐏owered 𝐁y © Keith Tech*

*📋 Status:* Sending audio now...`
        }, { quoted: message });

        // Send downloading reaction
        await sendReaction(sock, chatId, message, '⬇️');
        
        // Sanitize filename
        const fileName = `${video.title || 'song'}.mp3`
            .replace(/[<>:"/\\|?*]+/g, '')
            .substring(0, 200);
        
        // Download URL from audioData
        const downloadUrl = audioData.download || audioData.dl || audioData.url;
        
        if (!downloadUrl || !downloadUrl.startsWith('http')) {
            throw new Error('Invalid download URL');
        }
        
        // Send the audio file
        await sock.sendMessage(chatId, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: fileName,
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: video.title || 'Moon XMD Music',
                    body: '🎵 MP3 Audio | Powered by Keith Tech',
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url || '',
                    mediaType: 1,
                    previewType: 0,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: message });

   

    } catch (err) {
        console.error('Song command error:', err);
        await sendReaction(sock, chatId, message, '❌');
        await sock.sendMessage(chatId, { 
            text: `*❌ MP3 Download Error!*\n${err.message || 'Please try again later.'}\n\n*Note:* This command downloads MP3 audio only.\nFor videos, use \`.ytmp4 <youtube link>\`` 
        }, { quoted: message });
    }
}

module.exports = songCommand;