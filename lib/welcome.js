/*

CODES BY KEITH TECH 

*/
const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { delay } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');

async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╔═══════════════════╗
║  📥 *WELCOME SETUP*  ║
╚═══════════════════╝

*Commands:*
• .welcome on - Enable welcomes
• .welcome off - Disable welcomes
• .welcome set [message] - Set custom message

*Available Variables:*
• {user} - Mentions new member
• {group} - Group name
• {description} - Group description

*Example:*
.welcome set Hello {user}! Welcome to {group} 🎉`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417440480101@newsletter',
                    newsletterName: 'KEITH TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ Welcome messages are *already enabled* for this group.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363417440480101@newsletter',
                        newsletterName: 'KEITH TECH',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        await addWelcome(chatId, true, '✨ Welcome {user} to {group}! 🎉\n\n📝 {description}');
        return sock.sendMessage(chatId, { 
            text: '✅ Welcome messages *enabled* successfully!\n\n💡 Use `.welcome set [message]` to customize.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417440480101@newsletter',
                    newsletterName: 'KEITH TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    if (lowerCommand === 'off') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ Welcome messages are *already disabled* for this group.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363417440480101@newsletter',
                        newsletterName: 'KEITH TECH',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, { 
            text: '❌ Welcome messages *disabled* for this group.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417440480101@newsletter',
                    newsletterName: 'KEITH TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ Please provide a custom message!\n\n*Example:*\n.welcome set Welcome {user} to {group}! 🎉',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363417440480101@newsletter',
                        newsletterName: 'KEITH TECH',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, { 
            text: '✅ Custom welcome message *set successfully*!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417440480101@newsletter',
                    newsletterName: 'KEITH TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: `❌ Invalid command!\n\n*Usage:*\n• .welcome on\n• .welcome set [message]\n• .welcome off`,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363417440480101@newsletter',
                newsletterName: 'KEITH TECH',
                serverMessageId: -1
            }
        }
    }, { quoted: message });
}

async function handleGoodbye(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╔═══════════════════╗
║  📤 *GOODBYE SETUP*  ║
╚═══════════════════╝

*Commands:*
• .goodbye on - Enable goodbyes
• .goodbye off - Disable goodbyes
• .goodbye set [message] - Set custom message

*Available Variables:*
• {user} - Mentions leaving member
• {group} - Group name

*Example:*
.goodbye set Goodbye {user}! We'll miss you 💔`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417440480101@newsletter',
                    newsletterName: 'KEITH TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ Goodbye messages are *already enabled* for this group.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363417440480101@newsletter',
                        newsletterName: 'KEITH TECH',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        await addGoodbye(chatId, true, '😢 We lost our soldier!\n\n💔 We will miss you {user}');
        return sock.sendMessage(chatId, { 
            text: '✅ Goodbye messages *enabled* successfully!\n\n💡 Use `.goodbye set [message]` to customize.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417440480101@newsletter',
                    newsletterName: 'KEITH TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    if (lowerCommand === 'off') {
        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ Goodbye messages are *already disabled* for this group.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363417440480101@newsletter',
                        newsletterName: 'KEITH TECH',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        await delGoodBye(chatId);
        return sock.sendMessage(chatId, { 
            text: '❌ Goodbye messages *disabled* for this group.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417440480101@newsletter',
                    newsletterName: 'KEITH TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ Please provide a custom message!\n\n*Example:*\n.goodbye set Goodbye {user}! 👋',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363417440480101@newsletter',
                        newsletterName: 'KEITH TECH',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        await addGoodbye(chatId, true, customMessage);
        return sock.sendMessage(chatId, { 
            text: '✅ Custom goodbye message *set successfully*!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363417440480101@newsletter',
                    newsletterName: 'KEITH TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: `❌ Invalid command!\n\n*Usage:*\n• .goodbye on\n• .goodbye set [message]\n• .goodbye off`,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363417440480101@newsletter',
                newsletterName: 'KEITH TECH',
                serverMessageId: -1
            }
        }
    }, { quoted: message });
}

module.exports = { handleWelcome, handleGoodbye };