const settings = require('../settings');


const Vcard = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴇɪᴛʜ ᴛᴇᴄʜ",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:KEITH\nORG:MOON-XMD;\nTEL;type=CELL;type=VOICE;waid=${settings.ownerNumber}:${settings.ownerNumber}\nEND:VCARD`
      }
    }
  };

module.exports = {

Vcard

}