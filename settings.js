/*==================================

      🌙 MOON XMD 🌙
  DEVELOPED BY KEITH TECH
    
  
 K E I T H   T E C H
 
- Owner: Keith 
- Github: https://github.com/mrkeithtech/
- Telegram: https://t.me/mrkeithtech


================================*/

const fs = require('fs')
if (fs.existsSync('.env')) require('dotenv').config({ path: __dirname+'/.env' })

const settings = {

//====== DONT CHANGE =============//
  packname: process.env.packname || 'Mr Keith Tech',
  
  
  author: process.env.authour || 'KEITH TECH',
  
//======= BOT SETTINGS ============//

  SESSION_ID: process.env.SESSION_ID || '',
  

  botName: process.env.botName || "𝐌𝐎𝐎𝐍 𝐗𝐌𝐃 🌙",
  
  
  commandMode: process.env.commandMode || "private",
  
  
  timezone: process.env.timezone || "Africa/Harare",
  
  
  botOwner: process.env.botOwner || 'ᴋᴇɪᴛʜ ᴛᴇᴄʜ',
  
  ownerNumber: process.env.ownerNumber || '263776509966',
  
  //======== ANTIEDIT SETTINGS ===========//
  antieditMode: process.env.antieditMode || "private", // "public" or "private"
  
  antieditEnabled: process.env.antieditEnabled || true, // true or false
  
  
  // Examples: '.' or ['.', '!', '#', '$']
  Prefix: process.env.Prefix ? (process.env.Prefix.includes(',') ? process.env.Prefix.split(',') : process.env.Prefix) : ['.', '!', '#', '$'],
  
  
  
  
//======== DONT CHANGE ===========//
  giphyApiKey: process.env.giphyApiKey || 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  
  
  maxStoreMessages: process.env.maxStoreMessages || 20, 
  
  
  storeWriteInterval: process.env.storeWriteInterval || 10000,
  
  
  description: process.env.description || "ADVANCED W.A BOT DEVELOPED BY KEITH TECH",
  
  version: process.env.version || "1.0.0",
  
};

module.exports = settings;