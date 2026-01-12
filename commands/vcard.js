const fs = require('fs');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function vcardCommand(sock, chatId, message, isGroup, isOwner, groupMetadata) {
    try {
        if (!isGroup) {
            await sock.sendMessage(chatId, {
                text: "This command is for groups only."
            }, { quoted: message });
            return;
        }

        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: "*_This command is for the owner only_*"
            }, { quoted: message });
            return;
        }

        const { participants } = groupMetadata;
        let vcard = '';
        let noPort = 0;

        for (let a of participants) {
            vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:[${noPort++}] +${a.id.split("@")[0]}\nTEL;type=CELL;type=VOICE;waid=${a.id.split("@")[0]}:+${a.id.split("@")[0]}\nEND:VCARD\n`;
        }

        let nmfilect = './contacts.vcf';
        await sock.sendMessage(chatId, {
            text: 'Saving ' + participants.length + ' participants contact'
        }, { quoted: message });

        fs.writeFileSync(nmfilect, vcard.trim());
        await sleep(2000);

        await sock.sendMessage(chatId, {
            document: fs.readFileSync(nmfilect),
            mimetype: 'text/vcard',
            fileName: 'MOON-XMD.vcf',
            caption: `\nDone saving.\nGroup Name: *${groupMetadata.subject}*\nContacts: *${participants.length}*\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋᴇɪᴛʜ`
        }, { quoted: message });

        fs.unlinkSync(nmfilect);
    } catch (err) {
        await sock.sendMessage(chatId, {
            text: err.toString()
        }, { quoted: message });
    }
}

module.exports = vcardCommand;