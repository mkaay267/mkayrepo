const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function tourlCommand(sock, chatId, message) {
  try {
    // Check if message is a reply to media
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quotedMsg) {
      await sock.sendMessage(chatId, { 
        text: '❌ Please reply to an image, video, or audio file with .tourl\n\nExample: Reply to an image and type .tourl' 
      }, { quoted: message });
      return;
    }

    // Send initial uploading message
    const uploadingMsg = await sock.sendMessage(chatId, { 
      text: '⏳ Detecting media and uploading to Catbox...' 
    });

    // Determine media type and download
    let mediaType = null;
    let mimeType = '';
    let mediaBuffer = null;
    let fileName = '';

    // Get message key for download
    const messageKey = {
      remoteJid: chatId,
      id: message.message.extendedTextMessage.contextInfo.stanzaId,
      participant: message.message.extendedTextMessage.contextInfo.participant
    };

    try {
      if (quotedMsg.imageMessage) {
        mediaType = 'Image';
        mimeType = quotedMsg.imageMessage.mimetype || 'image/jpeg';
        fileName = quotedMsg.imageMessage.fileName || `image_${Date.now()}.jpg`;
        mediaBuffer = await sock.downloadMediaMessage(
          { key: messageKey, message: quotedMsg },
          'buffer'
        );
      } else if (quotedMsg.videoMessage) {
        mediaType = 'Video';
        mimeType = quotedMsg.videoMessage.mimetype || 'video/mp4';
        fileName = quotedMsg.videoMessage.fileName || `video_${Date.now()}.mp4`;
        mediaBuffer = await sock.downloadMediaMessage(
          { key: messageKey, message: quotedMsg },
          'buffer'
        );
      } else if (quotedMsg.audioMessage) {
        mediaType = 'Audio';
        mimeType = quotedMsg.audioMessage.mimetype || 'audio/mpeg';
        fileName = quotedMsg.audioMessage.fileName || `audio_${Date.now()}.mp3`;
        mediaBuffer = await sock.downloadMediaMessage(
          { key: messageKey, message: quotedMsg },
          'buffer'
        );
      } else if (quotedMsg.documentMessage) {
        mediaType = 'Document';
        mimeType = quotedMsg.documentMessage.mimetype || 'application/octet-stream';
        fileName = quotedMsg.documentMessage.fileName || `file_${Date.now()}.bin`;
        mediaBuffer = await sock.downloadMediaMessage(
          { key: messageKey, message: quotedMsg },
          'buffer'
        );
      } else {
        await sock.sendMessage(chatId, { 
          text: '❌ Unsupported media type. Please reply to an image, video, audio, or document file.' 
        }, { quoted: message });
        await sock.sendMessage(chatId, { delete: uploadingMsg.key });
        return;
      }
    } catch (downloadError) {
      console.error('Download error:', downloadError);
      await sock.sendMessage(chatId, { 
        text: '❌ Failed to download media. The file might be too large or corrupted.' 
      }, { quoted: message });
      await sock.sendMessage(chatId, { delete: uploadingMsg.key });
      return;
    }

    if (!mediaBuffer || mediaBuffer.length === 0) {
      await sock.sendMessage(chatId, { 
        text: '❌ Could not retrieve media data. The file might be expired or inaccessible.' 
      }, { quoted: message });
      await sock.sendMessage(chatId, { delete: uploadingMsg.key });
      return;
    }

    // Save to temp file
    const tempFilePath = path.join(os.tmpdir(), `catbox_upload_${Date.now()}_${fileName}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Update uploading message
    await sock.sendMessage(chatId, { 
      delete: uploadingMsg.key 
    });
    
    const processingMsg = await sock.sendMessage(chatId, { 
      text: `⏳ Uploading ${mediaType} (${formatBytes(mediaBuffer.length)}) to Catbox...` 
    });

    try {
      // Prepare form data for Catbox
      const form = new FormData();
      form.append('fileToUpload', fs.createReadStream(tempFilePath), fileName);
      form.append('reqtype', 'fileupload');

      // Upload to Catbox
      const response = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
        timeout: 60000, // 60 seconds timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      if (!response.data || typeof response.data !== 'string') {
        throw new Error("Invalid response from Catbox");
      }

      const mediaUrl = response.data.trim();
      
      if (!mediaUrl.startsWith('http')) {
        throw new Error("Upload failed: " + mediaUrl);
      }

      // Delete processing message and send success
      await sock.sendMessage(chatId, { delete: processingMsg.key });

      // Create response message
      let responseText = `✅ *${mediaType} Uploaded Successfully*\n\n`;
      responseText += `📊 *Size:* ${formatBytes(mediaBuffer.length)}\n`;
      responseText += `📁 *File:* ${fileName}\n`;
      responseText += `🔗 *URL:* ${mediaUrl}\n\n`;
      
      if (mediaType === 'Image') {
        responseText += `📸 *Image Preview:* ${mediaUrl}\n`;
      } else if (mediaType === 'Video') {
        responseText += `🎥 *Video Link:* ${mediaUrl}\n`;
      }
      
      responseText += `\n> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴇɪᴛʜ-ᴛᴇᴄʜ`;

      await sock.sendMessage(chatId, {
        text: responseText
      }, { quoted: message });

    } catch (uploadError) {
      // Clean up temp file on error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      console.error('Upload error:', uploadError);
      await sock.sendMessage(chatId, { delete: processingMsg.key });
      
      let errorMsg = '❌ Failed to upload to Catbox. ';
      if (uploadError.code === 'ECONNABORTED') {
        errorMsg += 'The upload timed out. File might be too large.';
      } else if (uploadError.message.includes('413')) {
        errorMsg += 'File is too large for Catbox.';
      } else {
        errorMsg += uploadError.message || 'Please try again later.';
      }
      
      await sock.sendMessage(chatId, { 
        text: errorMsg 
      }, { quoted: message });
    }

  } catch (error) {
    console.error('Error in tourl command:', error);
    await sock.sendMessage(chatId, { 
      text: `❌ Unexpected error: ${error.message || 'Please try again'}` 
    }, { quoted: message });
  }
}

module.exports = tourlCommand;