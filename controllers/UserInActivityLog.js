const { logToFile } = require('../controllers/FileLogging');
const { uIOhook } = require('uiohook-napi');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const screenshot = require('screenshot-desktop');
const os = require('os');
const activeWin = require('active-win');
const { formatDuration, formatTimestamp, getFormattedDate } = require('../utils/Format');

const screenshotDir = path.resolve(__dirname, '../', 'UserActivityScreenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir); 
}

const getInactivityLogFilePath = () => {
    const formattedDate = getFormattedDate();
    return path.resolve(__dirname, `../Logs/inactivity_log_${formattedDate}.js`);
};
const inactivityLogFilePath = getInactivityLogFilePath();

const loggedInUser = () => os.userInfo().username;

const inactivityDuration = 60000; 
const loggingDuration = 60000; 
let lastActivityTime = Date.now();
let lastKeyPressTime = Date.now();
let lastMouseMoveTime = Date.now();
let loggedTime = 0;

const logUserActivity = (eventType, screenshot) => {
    const logEntry = {
        user: loggedInUser(),
        event: eventType,
        screenshot: screenshot,
        message: eventType === "UserIdle"
            ? `User idle for ${formatDuration(inactivityDuration)} with no activity.`
            : `User active with ${eventType === "Key Press" ? "Key Press" : "mouse movement"} detected.`,
        createdOn: formatTimestamp(new Date()),
    };
    logToFile(inactivityLogFilePath, logEntry);
};

// Check for inactivity every minute
const checkActivity = async () => {
    const window = await activeWin();
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - lastActivityTime;

    // Generate log after every specific time
    if (currentTime - loggedTime >= loggingDuration) {
        if (timeSinceLastActivity >= inactivityDuration) {
            // No activity in the last minute
            const screenshot = await Screenshot(window.title); // Await the screenshot
            logUserActivity("UserIdle", screenshot);
            loggedTime = currentTime; // Update last log time
        } else {
            // Activity detected, check which type and log once per minute
            if (currentTime - lastKeyPressTime < inactivityDuration) {
                captureScreenshot(window.title); // Await the screenshot
                logUserActivity("Key Press", screenshot);
                loggedTime = currentTime; // Update last key log time
            }
            if (currentTime - lastMouseMoveTime < inactivityDuration) {
                captureScreenshot(window.title); // Await the screenshot
                logUserActivity("Mouse Move", screenshot);
                loggedTime = currentTime; // Update last mouse log time
            }
        }
    }
};



const captureScreenshot = async (context) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const screenshotPath = path.join(screenshotDir, `${context}_${timestamp}.png`);
   
    screenshot({ filename: screenshotPath })
        .then(() => {
            console.log('Screenshot saved:', screenshotPath);
        })
        .catch((error) => {
            console.error('Error capturing screenshot:', error);
        });
};

// Reset the keyboard inactivity timer
const resetKeyInactivityTimer = () => {
    lastKeyPressTime = Date.now();
    lastActivityTime = Date.now();
};

// Reset the mouse inactivity timer
const resetMouseInactivityTimer = () => {
    lastMouseMoveTime = Date.now();
    lastActivityTime = Date.now();
};

// Listen for keydown events
uIOhook.on('keydown', resetKeyInactivityTimer);

// Listen for mouse movement events
uIOhook.on("mousemove", resetMouseInactivityTimer);

// Start the hook to listen for events
uIOhook.start();

module.exports = { resetKeyInactivityTimer, resetMouseInactivityTimer, checkActivity };
