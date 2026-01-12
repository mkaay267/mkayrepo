const fs = require('fs');
const path = require('path');
const settings = require('../settings');

const PREFIX_FILE = path.join(__dirname, '../data/prefix.json');

// Initialize prefix data file
function initPrefixData() {
    if (!fs.existsSync(path.dirname(PREFIX_FILE))) {
        fs.mkdirSync(path.dirname(PREFIX_FILE), { recursive: true });
    }
    
    if (!fs.existsSync(PREFIX_FILE)) {
        const defaultData = {
            prefixes: Array.isArray(settings.Prefix) ? settings.Prefix : [settings.Prefix]
        };
        fs.writeFileSync(PREFIX_FILE, JSON.stringify(defaultData, null, 2));
    }
}

// Read prefix settings
function readPrefixData() {
    try {
        initPrefixData();
        const data = fs.readFileSync(PREFIX_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading prefix data:', error);
        return { prefixes: Array.isArray(settings.Prefix) ? settings.Prefix : [settings.Prefix] };
    }
}

// Write prefix settings
function writePrefixData(data) {
    try {
        fs.writeFileSync(PREFIX_FILE, JSON.stringify(data, null, 2));
        
        // Also update settings.js file
        const settingsPath = path.join(__dirname, '../settings.js');
        let settingsContent = fs.readFileSync(settingsPath, 'utf-8');
        
        // Format prefix for settings file
        const prefixValue = Array.isArray(data.prefixes) && data.prefixes.length > 1
            ? `[${data.prefixes.map(p => `'${p}'`).join(', ')}]`
            : `'${data.prefixes[0]}'`;
        
        // Replace the Prefix value
        const regex = /Prefix:\s*process\.env\.Prefix.*?\]\s*:\s*\[?['"].*?['"](?:\])?/s;
        settingsContent = settingsContent.replace(
            regex,
            `Prefix: process.env.Prefix ? (process.env.Prefix.includes(',') ? process.env.Prefix.split(',') : process.env.Prefix) : ${prefixValue}`
        );
        
        fs.writeFileSync(settingsPath, settingsContent);
        
        return true;
    } catch (error) {
        console.error('Error writing prefix data:', error);
        return false;
    }
}

// Get current prefixes
function getPrefixes() {
    const data = readPrefixData();
    return data.prefixes || (Array.isArray(settings.Prefix) ? settings.Prefix : [settings.Prefix]);
}

// Set prefixes
function setPrefixes(prefixes) {
    const data = readPrefixData();
    data.prefixes = Array.isArray(prefixes) ? prefixes : [prefixes];
    return writePrefixData(data);
}

// Add a prefix
function addPrefix(prefix) {
    const data = readPrefixData();
    if (!data.prefixes.includes(prefix)) {
        data.prefixes.push(prefix);
        return writePrefixData(data);
    }
    return false; // Already exists
}

// Remove a prefix
function removePrefix(prefix) {
    const data = readPrefixData();
    if (data.prefixes.length <= 1) {
        return false; // Can't remove last prefix
    }
    const index = data.prefixes.indexOf(prefix);
    if (index > -1) {
        data.prefixes.splice(index, 1);
        return writePrefixData(data);
    }
    return false; // Not found
}

module.exports = {
    getPrefixes,
    setPrefixes,
    addPrefix,
    removePrefix,
    readPrefixData,
    writePrefixData
    };