/*
CODES BY KEITH TECH
*/

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const chalk = require('chalk');

// GitHub repository configuration
const REPO_URL = 'https://github.com/mrkeithtech/Moon-Xmd';
const BRANCH = 'main';
const ZIP_URL = `${REPO_URL}/archive/refs/heads/${BRANCH}.zip`;

/**
 * Execute shell command
 */
function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true, timeout: 60000 }, (err, stdout, stderr) => {
            if (err) {
                return reject(new Error((stderr || stdout || err.message || '').toString().trim()));
            }
            resolve((stdout || '').toString().trim());
        });
    });
}

/**
 * Check if git repository exists and is valid
 */
async function hasGitRepo() {
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) return false;
    
    try {
        await run('git --version');
        await run('git rev-parse --is-inside-work-tree');
        return true;
    } catch {
        return false;
    }
}

/**
 * Update via Git (fastest and most reliable method)
 */
async function updateViaGit() {
    console.log(chalk.cyan('🔄 Updating via Git...'));
    
    // Get current commit
    const oldCommit = await run('git rev-parse HEAD').catch(() => 'unknown');
    
    // Stash any local changes
    try {
        await run('git stash');
    } catch (e) {
        console.log('No local changes to stash');
    }
    
    // Fetch latest changes
    await run('git fetch origin');
    
    // Get latest commit from remote
    const newCommit = await run(`git rev-parse origin/${BRANCH}`);
    
    // Check if already up to date
    const alreadyUpToDate = oldCommit === newCommit;
    
    if (alreadyUpToDate) {
        return {
            success: true,
            alreadyUpToDate: true,
            message: '✅ Already up to date!',
            oldCommit: oldCommit.substring(0, 7),
            newCommit: newCommit.substring(0, 7)
        };
    }
    
    // Get commit differences
    const commitLog = await run(`git log --oneline ${oldCommit}..${newCommit}`).catch(() => 'No commit info');
    const filesChanged = await run(`git diff --name-only ${oldCommit} ${newCommit}`).catch(() => '');
    
    // Pull latest changes
    await run(`git reset --hard origin/${BRANCH}`);
    await run('git clean -fd');
    
    // Try to restore stashed changes
    try {
        await run('git stash pop');
    } catch (e) {
        console.log('No stashed changes to restore');
    }
    
    return {
        success: true,
        alreadyUpToDate: false,
        message: '✅ Updated successfully via GitHub!',
        oldCommit: oldCommit.substring(0, 7),
        newCommit: newCommit.substring(0, 7),
        commitLog,
        filesChanged
    };
}

/**
 * Download file with redirect support
 */
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const maxRedirects = 5;
        let redirectCount = 0;
        
        function makeRequest(currentUrl) {
            if (redirectCount > maxRedirects) {
                return reject(new Error('Too many redirects'));
            }
            
            https.get(currentUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Moon-Xmd-Updater/1.0)',
                    'Accept': '*/*'
                }
            }, (res) => {
                // Handle redirects
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) {
                        return reject(new Error(`Redirect without location header`));
                    }
                    
                    redirectCount++;
                    res.resume();
                    
                    const nextUrl = location.startsWith('http') 
                        ? location 
                        : new URL(location, currentUrl).toString();
                    
                    return makeRequest(nextUrl);
                }
                
                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                }
                
                const file = fs.createWriteStream(dest);
                let downloaded = 0;
                const total = parseInt(res.headers['content-length'] || '0', 10);
                
                res.on('data', (chunk) => {
                    downloaded += chunk.length;
                    if (total > 0) {
                        const percent = ((downloaded / total) * 100).toFixed(1);
                        process.stdout.write(`\r📥 Downloading: ${percent}%`);
                    }
                });
                
                res.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    console.log('\n✅ Download complete');
                    resolve();
                });
                
                file.on('error', (err) => {
                    file.close();
                    fs.unlink(dest, () => {});
                    reject(err);
                });
            }).on('error', (err) => {
                reject(err);
            });
        }
        
        makeRequest(url);
    });
}

/**
 * Extract ZIP file
 */
async function extractZip(zipPath, outDir) {
    console.log(chalk.cyan('📦 Extracting files...'));
    
    // Ensure output directory exists
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    
    // Try different extraction methods based on platform
    if (process.platform === 'win32') {
        // Windows: Use PowerShell
        const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\/g, '/')}' -Force"`;
        await run(cmd);
    } else {
        // Unix-like systems: Try unzip, then 7z, then tar
        try {
            await run(`unzip -o -q '${zipPath}' -d '${outDir}'`);
        } catch {
            try {
                await run(`7z x -y '${zipPath}' -o'${outDir}' > /dev/null`);
            } catch {
                throw new Error('No extraction tool found (unzip/7z). Please install unzip or 7z.');
            }
        }
    }
    
    console.log(chalk.green('✅ Extraction complete'));
}

/**
 * Copy files recursively while preserving important directories
 */
function copyRecursive(src, dest, options = {}) {
    const { ignore = [], preserve = [], onFile = null } = options;
    const copiedFiles = [];
    
    function copy(srcPath, destPath, relative = '') {
        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
        }
        
        const entries = fs.readdirSync(srcPath);
        
        for (const entry of entries) {
            // Skip ignored items
            if (ignore.includes(entry)) continue;
            
            const srcFile = path.join(srcPath, entry);
            const destFile = path.join(destPath, entry);
            const relPath = path.join(relative, entry);
            const stat = fs.lstatSync(srcFile);
            
            if (stat.isDirectory()) {
                copy(srcFile, destFile, relPath);
            } else {
                fs.copyFileSync(srcFile, destFile);
                copiedFiles.push(relPath.replace(/\\/g, '/'));
                
                if (onFile) {
                    onFile(relPath);
                }
            }
        }
    }
    
    copy(src, dest);
    return copiedFiles;
}

/**
 * Update via ZIP download (fallback method)
 */
async function updateViaZip() {
    console.log(chalk.cyan('🔄 Updating via ZIP download...'));
    
    const tmpDir = path.join(process.cwd(), 'tmp');
    const zipPath = path.join(tmpDir, 'update.zip');
    const extractDir = path.join(tmpDir, 'extract');
    
    // Create temp directory
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    // Clean previous extraction
    if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
    }
    
    // Download latest code
    console.log(chalk.cyan('📥 Downloading latest version...'));
    await downloadFile(ZIP_URL, zipPath);
    
    // Extract
    await extractZip(zipPath, extractDir);
    
    // Find the extracted folder (GitHub creates a folder like "Moon-Xmd-main")
    const extractedContents = fs.readdirSync(extractDir);
    const repoFolder = extractedContents.find(name => name.startsWith('Moon-Xmd'));
    
    if (!repoFolder) {
        throw new Error('Could not find extracted repository folder');
    }
    
    const srcRoot = path.join(extractDir, repoFolder);
    
    // Preserve critical files/directories
    const preserve = ['session', 'data', 'node_modules', '.env', 'baileys_store.json'];
    const ignore = ['.git', 'tmp', 'temp', '.gitignore', '.github'];
    
    // Backup settings if they exist
    let preservedSettings = null;
    const settingsPath = path.join(process.cwd(), 'settings.js');
    
    try {
        const currentSettings = require('../settings');
        preservedSettings = {
            ownerNumber: currentSettings.ownerNumber,
            botOwner: currentSettings.botOwner,
            SESSION_ID: currentSettings.SESSION_ID,
            Prefix: currentSettings.Prefix
        };
    } catch (e) {
        console.log('Could not backup settings');
    }
    
    // Copy files
    console.log(chalk.cyan('📝 Copying updated files...'));
    const copiedFiles = copyRecursive(srcRoot, process.cwd(), {
        ignore,
        onFile: (file) => {
            process.stdout.write(`\r📝 Copying: ${file.substring(0, 50)}...`);
        }
    });
    
    console.log(`\n✅ Copied ${copiedFiles.length} files`);
    
    // Restore settings
    if (preservedSettings) {
        try {
            let settingsContent = fs.readFileSync(settingsPath, 'utf8');
            
            if (preservedSettings.ownerNumber) {
                settingsContent = settingsContent.replace(
                    /ownerNumber:\s*process\.env\.ownerNumber\s*\|\|\s*['"][^'"]*['"]/,
                    `ownerNumber: process.env.ownerNumber || '${preservedSettings.ownerNumber}'`
                );
            }
            
            if (preservedSettings.botOwner) {
                settingsContent = settingsContent.replace(
                    /botOwner:\s*process\.env\.botOwner\s*\|\|\s*['"][^'"]*['"]/,
                    `botOwner: process.env.botOwner || '${preservedSettings.botOwner}'`
                );
            }
            
            if (preservedSettings.SESSION_ID) {
                settingsContent = settingsContent.replace(
                    /SESSION_ID:\s*process\.env\.SESSION_ID\s*\|\|\s*['"][^'"]*['"]/,
                    `SESSION_ID: process.env.SESSION_ID || '${preservedSettings.SESSION_ID}'`
                );
            }
            
            fs.writeFileSync(settingsPath, settingsContent);
            console.log(chalk.green('✅ Settings restored'));
        } catch (e) {
            console.log(chalk.yellow('⚠️  Could not restore settings'));
        }
    }
    
    // Cleanup
    try {
        fs.rmSync(extractDir, { recursive: true, force: true });
        fs.rmSync(zipPath, { force: true });
    } catch (e) {
        console.log('Cleanup warning:', e.message);
    }
    
    return {
        success: true,
        message: '✅ Updated successfully via ZIP!',
        filesUpdated: copiedFiles.length
    };
}

/**
 * Install/update dependencies
 */
async function updateDependencies() {
    console.log(chalk.cyan('📦 Updating dependencies...'));
    
    try {
        await run('npm install --no-audit --no-fund --prefer-offline');
        console.log(chalk.green('✅ Dependencies updated'));
        return true;
    } catch (e) {
        console.log(chalk.yellow('⚠️  Could not update dependencies:'), e.message);
        return false;
    }
}

/**
 * Restart the bot process
 */
async function restartBot(sock, chatId, message) {
    console.log(chalk.cyan('🔄 Restarting bot...'));
    
    try {
        await sock.sendMessage(chatId, {
            text: '🔄 *Restarting bot...*\n\nPlease wait a moment, then type `.ping` to check if I\'m back online! 🚀',
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
    } catch (e) {
        console.log('Could not send restart message');
    }
    
    // Wait a bit for message to send
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try PM2 first
    try {
        await run('pm2 restart all');
        return;
    } catch (e) {
        console.log('PM2 not available, using process exit');
    }
    
    // Exit process (panel will auto-restart)
    process.exit(0);
}

/**
 * Main update command
 */
async function updateCommand(sock, chatId, message, senderIsSudo) {
    // Check permissions
    if (!message.key.fromMe && !senderIsSudo) {
        await sock.sendMessage(chatId, {
            text: '❌ *Access Denied!*\n\nOnly the bot owner can use this command.',
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
    
    const startTime = Date.now();
    
    try {
        // Send initial message
        await sock.sendMessage(chatId, {
            text: `
> 🔄 *UPDATING BOT*

📥 Fetching latest version from GitHub...
⏳ Please wait...

*Repository:* Moon Xmd
*Branch:* ${BRANCH}`,
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
        
        let updateResult;
        
        // Try Git first (faster and more reliable)
        if (await hasGitRepo()) {
            console.log(chalk.cyan('✓ Git repository detected'));
            updateResult = await updateViaGit();
        } else {
            console.log(chalk.yellow('⚠ No Git repository, using ZIP method'));
            updateResult = await updateViaZip();
        }
        
        // Update dependencies
        await updateDependencies();
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Send success message
        let successMessage = `     
> ✅ *UPDATE SUCCESS*

${updateResult.message}

⏱️ *Time taken:* ${duration}s
📦 *Repository:* Moon Xmd`;

        if (updateResult.oldCommit && updateResult.newCommit && !updateResult.alreadyUpToDate) {
            successMessage += `\n🔄 *Updated from:* ${updateResult.oldCommit} → ${updateResult.newCommit}`;
        }
        
        if (updateResult.filesUpdated) {
            successMessage += `\n📝 *Files updated:* ${updateResult.filesUpdated}`;
        }
        
        successMessage += '\n\n🔄 *Restarting in 3 seconds...*';
        
        await sock.sendMessage(chatId, {
            text: successMessage,
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
        
        // Wait 3 seconds then restart
        await new Promise(resolve => setTimeout(resolve, 3000));
        await restartBot(sock, chatId, message);
        
    } catch (error) {
        console.error(chalk.red('❌ Update failed:'), error);
        
        await sock.sendMessage(chatId, {
            text: `
> ❌ *UPDATE FAILED*

*Error:* ${error.message}

> *Need help?* Contact the owner!`,
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
}

module.exports = updateCommand;