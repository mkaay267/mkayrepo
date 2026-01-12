const { getPrefixes, setPrefixes, addPrefix, removePrefix } = require('../lib/prefixManager');

async function prefixCommand(sock, chatId, message, isOwnerOrSudo) {
    // Check if sender is owner or sudo
    if (!isOwnerOrSudo) {
        await sock.sendMessage(chatId, {
            text: '❌ This command is only available for the bot owner!',
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
        return;
    }

    const rawText = message.message?.conversation?.trim() ||
        message.message?.extendedTextMessage?.text?.trim() || '';
    
    const args = rawText.split(/\s+/);
    const action = args[1]?.toLowerCase(); // set/add/remove/list
    const prefixValue = args[2]; // The prefix character(s)

    const currentPrefixes = getPrefixes();

    // If no argument, show current prefixes and help
    if (!action) {
        const prefixList = currentPrefixes.map(p => `\`${p}\``).join(', ');
        
        await sock.sendMessage(chatId, {
            text: `
📋 *Current Prefix(es):* ${prefixList}

📝 *Usage:*
• prefix set <symbol> - Set single prefix
• prefix add <symbol> - Add new prefix
• prefix remove <symbol> - Remove a prefix
• prefix list - Show all prefixes

*Examples:*
• prefix set . - Set prefix to .
• prefix add ! - Add ! as additional prefix
• prefix remove # - Remove # prefix
• prefix set .!# - Set multiple prefixes

*Note:* You can use multiple prefixes simultaneously!`,
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
        return;
    }

    switch (action) {
        case 'set':
            if (!prefixValue) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please provide a prefix!\n\nExample: prefix set .',
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
                return;
            }

            // Check if multiple prefixes provided (e.g., ".!#")
            const newPrefixes = prefixValue.split('').filter(p => p.trim());
            
            if (setPrefixes(newPrefixes)) {
                const prefixList = newPrefixes.map(p => `\`${p}\``).join(', ');
                await sock.sendMessage(chatId, {
                    text: `✅ Prefix(es) set to: ${prefixList}\n\nAll commands will now work with ${newPrefixes.length > 1 ? 'these prefixes' : 'this prefix'}!`,
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
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to set prefix!',
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
            break;

        case 'add':
            if (!prefixValue || prefixValue.length !== 1) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please provide a single character prefix!\n\nExample: prefix add !',
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
                return;
            }

            if (currentPrefixes.includes(prefixValue)) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Prefix \`${prefixValue}\` already exists!`,
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
            } else if (addPrefix(prefixValue)) {
                const updatedPrefixes = getPrefixes();
                const prefixList = updatedPrefixes.map(p => `\`${p}\``).join(', ');
                await sock.sendMessage(chatId, {
                    text: `✅ Added prefix: \`${prefixValue}\`\n\nCurrent prefixes: ${prefixList}`,
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
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Failed to add prefix!',
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
            break;

        case 'remove':
        case 'delete':
            if (!prefixValue) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please provide a prefix to remove!\n\nExample: prefix remove !',
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
                return;
            }

            if (currentPrefixes.length <= 1) {
                await sock.sendMessage(chatId, {
                    text: '❌ Cannot remove the last prefix! Add another prefix first.',
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
            } else if (removePrefix(prefixValue)) {
                const updatedPrefixes = getPrefixes();
                const prefixList = updatedPrefixes.map(p => `\`${p}\``).join(', ');
                await sock.sendMessage(chatId, {
                    text: `✅ Removed prefix: \`${prefixValue}\`\n\nCurrent prefixes: ${prefixList}`,
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
            } else {
                await sock.sendMessage(chatId, {
                    text: `❌ Prefix \`${prefixValue}\` not found!`,
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
            break;

        case 'list':
        case 'show':
            const prefixList = currentPrefixes.map((p, i) => `${i + 1}. \`${p}\``).join('\n');
            await sock.sendMessage(chatId, {
                text: `
╔═════════════╗
║ 🔰 *ACTIVE PREFIXES*
╚═════════════╝

${prefixList}

*Total:* ${currentPrefixes.length} prefix${currentPrefixes.length > 1 ? 'es' : ''}`,
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
            break;

        default:
            await sock.sendMessage(chatId, {
                text: `❌ Invalid action: "${action}"

📝 *Valid Actions:*
• set - Set prefix(es)
• add - Add new prefix
• remove - Remove a prefix
• list - Show all prefixes

Type "prefix" without arguments for help.`,
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
            break;
    }
}

module.exports = prefixCommand;