const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363417440480101@newsletter',
            newsletterName: 'KEITH TECH',
            serverMessageId: -1
        }
    }
};

// Function to validate and format phone number
function formatPhoneNumber(number) {
    // Remove all non-numeric characters
    let cleanNumber = number.replace(/[^0-9]/g, '');
    
    // If number starts with 00, convert to +
    if (cleanNumber.startsWith('00')) {
        cleanNumber = cleanNumber.substring(2);
    }
    
    // If number starts with +, remove it (we'll add @ later)
    if (number.startsWith('+')) {
        cleanNumber = cleanNumber;
    }
    
    // Common country codes and their lengths (for validation)
    const countryCodePatterns = [
        { code: '1', minLength: 11, maxLength: 11 },      // USA, Canada
        { code: '7', minLength: 11, maxLength: 11 },      // Russia, Kazakhstan
        { code: '20', minLength: 12, maxLength: 12 },     // Egypt
        { code: '27', minLength: 11, maxLength: 11 },     // South Africa
        { code: '30', minLength: 12, maxLength: 12 },     // Greece
        { code: '31', minLength: 11, maxLength: 11 },     // Netherlands
        { code: '32', minLength: 11, maxLength: 11 },     // Belgium
        { code: '33', minLength: 11, maxLength: 11 },     // France
        { code: '34', minLength: 11, maxLength: 11 },     // Spain
        { code: '36', minLength: 11, maxLength: 11 },     // Hungary
        { code: '39', minLength: 12, maxLength: 13 },     // Italy
        { code: '40', minLength: 11, maxLength: 11 },     // Romania
        { code: '41', minLength: 11, maxLength: 11 },     // Switzerland
        { code: '43', minLength: 12, maxLength: 13 },     // Austria
        { code: '44', minLength: 12, maxLength: 13 },     // UK
        { code: '45', minLength: 10, maxLength: 10 },     // Denmark
        { code: '46', minLength: 11, maxLength: 12 },     // Sweden
        { code: '47', minLength: 10, maxLength: 10 },     // Norway
        { code: '48', minLength: 11, maxLength: 11 },     // Poland
        { code: '49', minLength: 11, maxLength: 13 },     // Germany
        { code: '51', minLength: 11, maxLength: 11 },     // Peru
        { code: '52', minLength: 12, maxLength: 12 },     // Mexico
        { code: '53', minLength: 10, maxLength: 10 },     // Cuba
        { code: '54', minLength: 12, maxLength: 13 },     // Argentina
        { code: '55', minLength: 12, maxLength: 13 },     // Brazil
        { code: '56', minLength: 11, maxLength: 11 },     // Chile
        { code: '57', minLength: 12, maxLength: 12 },     // Colombia
        { code: '58', minLength: 12, maxLength: 12 },     // Venezuela
        { code: '60', minLength: 11, maxLength: 12 },     // Malaysia
        { code: '61', minLength: 11, maxLength: 11 },     // Australia
        { code: '62', minLength: 11, maxLength: 13 },     // Indonesia
        { code: '63', minLength: 12, maxLength: 12 },     // Philippines
        { code: '64', minLength: 11, maxLength: 11 },     // New Zealand
        { code: '65', minLength: 10, maxLength: 10 },     // Singapore
        { code: '66', minLength: 11, maxLength: 11 },     // Thailand
        { code: '81', minLength: 12, maxLength: 12 },     // Japan
        { code: '82', minLength: 11, maxLength: 12 },     // South Korea
        { code: '84', minLength: 11, maxLength: 12 },     // Vietnam
        { code: '86', minLength: 13, maxLength: 13 },     // China
        { code: '90', minLength: 12, maxLength: 12 },     // Turkey
        { code: '91', minLength: 12, maxLength: 12 },     // India
        { code: '92', minLength: 12, maxLength: 12 },     // Pakistan
        { code: '93', minLength: 11, maxLength: 11 },     // Afghanistan
        { code: '94', minLength: 11, maxLength: 11 },     // Sri Lanka
        { code: '95', minLength: 10, maxLength: 11 },     // Myanmar
        { code: '98', minLength: 12, maxLength: 12 },     // Iran
        { code: '212', minLength: 12, maxLength: 12 },    // Morocco
        { code: '213', minLength: 12, maxLength: 12 },    // Algeria
        { code: '216', minLength: 11, maxLength: 11 },    // Tunisia
        { code: '218', minLength: 12, maxLength: 12 },    // Libya
        { code: '220', minLength: 10, maxLength: 10 },    // Gambia
        { code: '221', minLength: 12, maxLength: 12 },    // Senegal
        { code: '222', minLength: 11, maxLength: 11 },    // Mauritania
        { code: '223', minLength: 11, maxLength: 11 },    // Mali
        { code: '224', minLength: 12, maxLength: 12 },    // Guinea
        { code: '225', minLength: 12, maxLength: 12 },    // Ivory Coast
        { code: '226', minLength: 11, maxLength: 11 },    // Burkina Faso
        { code: '227', minLength: 11, maxLength: 11 },    // Niger
        { code: '228', minLength: 11, maxLength: 11 },    // Togo
        { code: '229', minLength: 11, maxLength: 11 },    // Benin
        { code: '230', minLength: 11, maxLength: 11 },    // Mauritius
        { code: '231', minLength: 10, maxLength: 11 },    // Liberia
        { code: '232', minLength: 11, maxLength: 11 },    // Sierra Leone
        { code: '233', minLength: 12, maxLength: 12 },    // Ghana
        { code: '234', minLength: 13, maxLength: 13 },    // Nigeria
        { code: '235', minLength: 11, maxLength: 11 },    // Chad
        { code: '236', minLength: 11, maxLength: 11 },    // Central African Republic
        { code: '237', minLength: 12, maxLength: 12 },    // Cameroon
        { code: '238', minLength: 10, maxLength: 10 },    // Cape Verde
        { code: '239', minLength: 10, maxLength: 10 },    // Sao Tome
        { code: '240', minLength: 12, maxLength: 12 },    // Equatorial Guinea
        { code: '241', minLength: 10, maxLength: 11 },    // Gabon
        { code: '242', minLength: 12, maxLength: 12 },    // Republic of Congo
        { code: '243', minLength: 12, maxLength: 12 },    // Democratic Republic of Congo
        { code: '244', minLength: 12, maxLength: 12 },    // Angola
        { code: '245', minLength: 10, maxLength: 10 },    // Guinea-Bissau
        { code: '246', minLength: 10, maxLength: 10 },    // British Indian Ocean Territory
        { code: '248', minLength: 10, maxLength: 10 },    // Seychelles
        { code: '249', minLength: 12, maxLength: 12 },    // Sudan
        { code: '250', minLength: 12, maxLength: 12 },    // Rwanda
        { code: '251', minLength: 12, maxLength: 12 },    // Ethiopia
        { code: '252', minLength: 11, maxLength: 11 },    // Somalia
        { code: '253', minLength: 11, maxLength: 11 },    // Djibouti
        { code: '254', minLength: 12, maxLength: 12 },    // Kenya
        { code: '255', minLength: 12, maxLength: 12 },    // Tanzania
        { code: '256', minLength: 12, maxLength: 12 },    // Uganda
        { code: '257', minLength: 11, maxLength: 11 },    // Burundi
        { code: '258', minLength: 12, maxLength: 12 },    // Mozambique
        { code: '260', minLength: 12, maxLength: 12 },    // Zambia
        { code: '261', minLength: 12, maxLength: 12 },    // Madagascar
        { code: '262', minLength: 12, maxLength: 12 },    // Reunion
        { code: '263', minLength: 12, maxLength: 12 },    // Zimbabwe
        { code: '264', minLength: 12, maxLength: 12 },    // Namibia
        { code: '265', minLength: 12, maxLength: 12 },    // Malawi
        { code: '266', minLength: 11, maxLength: 11 },    // Lesotho
        { code: '267', minLength: 11, maxLength: 11 },    // Botswana
        { code: '268', minLength: 11, maxLength: 11 },    // Swaziland
        { code: '269', minLength: 10, maxLength: 10 },    // Comoros
        { code: '290', minLength: 8, maxLength: 8 },      // Saint Helena
        { code: '291', minLength: 10, maxLength: 10 },    // Eritrea
        { code: '297', minLength: 10, maxLength: 10 },    // Aruba
        { code: '298', minLength: 8, maxLength: 8 },      // Faroe Islands
        { code: '299', minLength: 8, maxLength: 8 },      // Greenland
        { code: '350', minLength: 11, maxLength: 11 },    // Gibraltar
        { code: '351', minLength: 12, maxLength: 12 },    // Portugal
        { code: '352', minLength: 11, maxLength: 11 },    // Luxembourg
        { code: '353', minLength: 12, maxLength: 12 },    // Ireland
        { code: '354', minLength: 10, maxLength: 10 },    // Iceland
        { code: '355', minLength: 12, maxLength: 12 },    // Albania
        { code: '356', minLength: 11, maxLength: 11 },    // Malta
        { code: '357', minLength: 11, maxLength: 11 },    // Cyprus
        { code: '358', minLength: 11, maxLength: 12 },    // Finland
        { code: '359', minLength: 12, maxLength: 12 },    // Bulgaria
        { code: '370', minLength: 11, maxLength: 11 },    // Lithuania
        { code: '371', minLength: 11, maxLength: 11 },    // Latvia
        { code: '372', minLength: 10, maxLength: 11 },    // Estonia
        { code: '373', minLength: 11, maxLength: 11 },    // Moldova
        { code: '374', minLength: 11, maxLength: 11 },    // Armenia
        { code: '375', minLength: 12, maxLength: 12 },    // Belarus
        { code: '376', minLength: 9, maxLength: 9 },      // Andorra
        { code: '377', minLength: 11, maxLength: 11 },    // Monaco
        { code: '378', minLength: 12, maxLength: 12 },    // San Marino
        { code: '380', minLength: 12, maxLength: 12 },    // Ukraine
        { code: '381', minLength: 11, maxLength: 12 },    // Serbia
        { code: '382', minLength: 11, maxLength: 11 },    // Montenegro
        { code: '383', minLength: 11, maxLength: 11 },    // Kosovo
        { code: '385', minLength: 11, maxLength: 12 },    // Croatia
        { code: '386', minLength: 11, maxLength: 11 },    // Slovenia
        { code: '387', minLength: 11, maxLength: 11 },    // Bosnia
        { code: '389', minLength: 11, maxLength: 11 },    // Macedonia
        { code: '420', minLength: 12, maxLength: 12 },    // Czech Republic
        { code: '421', minLength: 12, maxLength: 12 },    // Slovakia
        { code: '423', minLength: 10, maxLength: 10 },    // Liechtenstein
        { code: '500', minLength: 8, maxLength: 8 },      // Falkland Islands
        { code: '501', minLength: 10, maxLength: 10 },    // Belize
        { code: '502', minLength: 11, maxLength: 11 },    // Guatemala
        { code: '503', minLength: 11, maxLength: 11 },    // El Salvador
        { code: '504', minLength: 11, maxLength: 11 },    // Honduras
        { code: '505', minLength: 11, maxLength: 11 },    // Nicaragua
        { code: '506', minLength: 11, maxLength: 11 },    // Costa Rica
        { code: '507', minLength: 11, maxLength: 11 },    // Panama
        { code: '508', minLength: 9, maxLength: 9 },      // Saint Pierre
        { code: '509', minLength: 11, maxLength: 11 },    // Haiti
        { code: '590', minLength: 12, maxLength: 12 },    // Guadeloupe
        { code: '591', minLength: 11, maxLength: 11 },    // Bolivia
        { code: '592', minLength: 10, maxLength: 10 },    // Guyana
        { code: '593', minLength: 12, maxLength: 12 },    // Ecuador
        { code: '594', minLength: 12, maxLength: 12 },    // French Guiana
        { code: '595', minLength: 12, maxLength: 12 },    // Paraguay
        { code: '596', minLength: 12, maxLength: 12 },    // Martinique
        { code: '597', minLength: 10, maxLength: 10 },    // Suriname
        { code: '598', minLength: 11, maxLength: 11 },    // Uruguay
        { code: '599', minLength: 10, maxLength: 11 },    // Netherlands Antilles
        { code: '670', minLength: 11, maxLength: 11 },    // East Timor
        { code: '672', minLength: 9, maxLength: 9 },      // Antarctica
        { code: '673', minLength: 10, maxLength: 10 },    // Brunei
        { code: '674', minLength: 10, maxLength: 10 },    // Nauru
        { code: '675', minLength: 11, maxLength: 11 },    // Papua New Guinea
        { code: '676', minLength: 8, maxLength: 8 },      // Tonga
        { code: '677', minLength: 10, maxLength: 10 },    // Solomon Islands
        { code: '678', minLength: 10, maxLength: 10 },    // Vanuatu
        { code: '679', minLength: 10, maxLength: 10 },    // Fiji
        { code: '680', minLength: 10, maxLength: 10 },    // Palau
        { code: '681', minLength: 9, maxLength: 9 },      // Wallis and Futuna
        { code: '682', minLength: 8, maxLength: 8 },      // Cook Islands
        { code: '683', minLength: 8, maxLength: 8 },      // Niue
        { code: '685', minLength: 10, maxLength: 10 },    // Samoa
        { code: '686', minLength: 8, maxLength: 8 },      // Kiribati
        { code: '687', minLength: 9, maxLength: 9 },      // New Caledonia
        { code: '688', minLength: 9, maxLength: 9 },      // Tuvalu
        { code: '689', minLength: 11, maxLength: 11 },    // French Polynesia
        { code: '690', minLength: 8, maxLength: 8 },      // Tokelau
        { code: '691', minLength: 10, maxLength: 10 },    // Micronesia
        { code: '692', minLength: 10, maxLength: 10 },    // Marshall Islands
        { code: '850', minLength: 12, maxLength: 13 },    // North Korea
        { code: '852', minLength: 11, maxLength: 11 },    // Hong Kong
        { code: '853', minLength: 11, maxLength: 11 },    // Macau
        { code: '855', minLength: 11, maxLength: 12 },    // Cambodia
        { code: '856', minLength: 11, maxLength: 12 },    // Laos
        { code: '880', minLength: 13, maxLength: 13 },    // Bangladesh
        { code: '886', minLength: 12, maxLength: 12 },    // Taiwan
        { code: '960', minLength: 10, maxLength: 10 },    // Maldives
        { code: '961', minLength: 11, maxLength: 11 },    // Lebanon
        { code: '962', minLength: 12, maxLength: 12 },    // Jordan
        { code: '963', minLength: 12, maxLength: 12 },    // Syria
        { code: '964', minLength: 12, maxLength: 12 },    // Iraq
        { code: '965', minLength: 11, maxLength: 11 },    // Kuwait
        { code: '966', minLength: 12, maxLength: 12 },    // Saudi Arabia
        { code: '967', minLength: 12, maxLength: 12 },    // Yemen
        { code: '968', minLength: 11, maxLength: 11 },    // Oman
        { code: '970', minLength: 12, maxLength: 12 },    // Palestine
        { code: '971', minLength: 12, maxLength: 12 },    // UAE
        { code: '972', minLength: 12, maxLength: 12 },    // Israel
        { code: '973', minLength: 11, maxLength: 11 },    // Bahrain
        { code: '974', minLength: 11, maxLength: 11 },    // Qatar
        { code: '975', minLength: 11, maxLength: 11 },    // Bhutan
        { code: '976', minLength: 11, maxLength: 11 },    // Mongolia
        { code: '977', minLength: 12, maxLength: 12 },    // Nepal
        { code: '992', minLength: 12, maxLength: 12 },    // Tajikistan
        { code: '993', minLength: 11, maxLength: 11 },    // Turkmenistan
        { code: '994', minLength: 12, maxLength: 12 },    // Azerbaijan
        { code: '995', minLength: 12, maxLength: 12 },    // Georgia
        { code: '996', minLength: 12, maxLength: 12 },    // Kyrgyzstan
        { code: '998', minLength: 12, maxLength: 12 },    // Uzbekistan
    ];
    
    // If number is less than 8 digits, it's likely invalid
    if (cleanNumber.length < 8) {
        return null;
    }
    
    // Check if number already has a valid country code
    let isValidFormat = false;
    for (const pattern of countryCodePatterns) {
        if (cleanNumber.startsWith(pattern.code)) {
            if (cleanNumber.length >= pattern.minLength && cleanNumber.length <= pattern.maxLength) {
                isValidFormat = true;
                break;
            }
        }
    }
    
    // If valid format found, return it
    if (isValidFormat) {
        return cleanNumber + '@s.whatsapp.net';
    }
    
    // If no valid country code found and number doesn't start with a known code
    // Return null to indicate invalid number
    return null;
}

async function getppCommand(sock, chatId, message, args) {
    try {
        let targetJid = null;

        // Check if replying to a message
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

        if (quotedParticipant) {
            targetJid = quotedParticipant;
        }
        // Check if number is provided
        else if (args && args.trim() !== '') {
            targetJid = formatPhoneNumber(args.trim());
            
            if (!targetJid) {
                await sock.sendMessage(chatId, {
                    text: '❌ *Invalid phone number format!*\n\n*e.g* 263xxx',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
        }
        // Check if mentioned
        else if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Get sender's profile pic
        else {
            targetJid = message.key.participant || message.key.remoteJid;
        }

        await sock.sendMessage(chatId, {
            text: '⏳ *Fetching profile picture...*',
            ...channelInfo
        }, { quoted: message });

        try {
            // Get profile picture URL
            const ppUrl = await sock.profilePictureUrl(targetJid, 'image');
            
            // Get user name
            let userName = 'User';
            try {
                userName = await sock.getName(targetJid);
            } catch (e) {
                userName = targetJid.split('@')[0];
            }
            
            // Send the profile picture
            await sock.sendMessage(chatId, {
                image: { url: ppUrl },
                caption: `📸 *Profile Picture*\n\n👤 *User:* ${userName}\n📱 *Number:* +${targetJid.split('@')[0]}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴏᴏɴ xᴍᴅ`,
                ...channelInfo
            }, { quoted: message });

        } catch (ppError) {
            // User doesn't have a profile picture
            await sock.sendMessage(chatId, {
                text: `❌ *No profile picture found!*\n\n👤 *User:* +${targetJid.split('@')[0]}\n\nThis user doesn't have a profile picture or it's set to private.`,
                ...channelInfo
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in getpp command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Failed to fetch profile picture!*\n\n*Usage:*\n• Reply to a message with `.getpp`\n• Use `.getpp @mention`\n• Use `.getpp +[country code][number]`\n• Use `.getpp` to get your own\n\n*Examples:*\n• `.getpp +263xxx`',
            ...channelInfo
        }, { quoted: message });
    }
}

module.exports = getppCommand;