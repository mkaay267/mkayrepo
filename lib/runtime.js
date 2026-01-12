/**
 * Runtime Utility Module
 * Tracks bot uptime and provides formatted uptime string
 */

// Store the bot start time when this module is first loaded
const startTime = Date.now();

/**
 * Calculate and format the uptime
 * @returns {string} Formatted uptime string (e.g., "2h 30m 45s")
 */
function getUptime() {
    const currentTime = Date.now();
    const uptimeMs = currentTime - startTime;
    
    // Convert milliseconds to seconds
    const totalSeconds = Math.floor(uptimeMs / 1000);
    
    // Calculate time components
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Build formatted string
    let uptimeStr = '';
    
    if (days > 0) {
        uptimeStr += `${days}d `;
    }
    if (hours > 0 || days > 0) {
        uptimeStr += `${hours}h `;
    }
    if (minutes > 0 || hours > 0 || days > 0) {
        uptimeStr += `${minutes}m `;
    }
    uptimeStr += `${seconds}s`;
    
    return uptimeStr.trim();
}

/**
 * Get detailed uptime breakdown
 * @returns {Object} Object containing days, hours, minutes, seconds
 */
function getDetailedUptime() {
    const currentTime = Date.now();
    const uptimeMs = currentTime - startTime;
    const totalSeconds = Math.floor(uptimeMs / 1000);
    
    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        totalSeconds: totalSeconds,
        totalMilliseconds: uptimeMs
    };
}

/**
 * Get uptime in long format
 * @returns {string} Long format uptime (e.g., "2 days, 3 hours, 45 minutes, 12 seconds")
 */
function getLongUptime() {
    const { days, hours, minutes, seconds } = getDetailedUptime();
    const parts = [];
    
    if (days > 0) {
        parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }
    if (seconds > 0 || parts.length === 0) {
        parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    }
    
    return parts.join(', ');
}

/**
 * Get the bot start timestamp
 * @returns {number} Start time in milliseconds
 */
function getStartTime() {
    return startTime;
}

/**
 * Get formatted start time
 * @returns {string} Formatted date and time when bot started
 */
function getFormattedStartTime() {
    const date = new Date(startTime);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

/**
 * Get uptime percentage of the day
 * @returns {string} Percentage of the current day the bot has been running
 */
function getDailyUptimePercentage() {
    const { totalSeconds } = getDetailedUptime();
    const secondsInDay = 86400;
    const percentage = Math.min((totalSeconds / secondsInDay) * 100, 100);
    return `${percentage.toFixed(2)}%`;
}

// Export all functions
module.exports = {
    getUptime,
    getDetailedUptime,
    getLongUptime,
    getStartTime,
    getFormattedStartTime,
    getDailyUptimePercentage
};