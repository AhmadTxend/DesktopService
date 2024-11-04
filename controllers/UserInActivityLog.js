const {logToFile} = require('../controllers/FileLogging');
const { uIOhook, UiohookKey } = require('uiohook-napi');
require('dotenv').config();
const path = require('path');
const os = require('os');


const inactivityLogFilePath = path.resolve(__dirname, '../', process.env.INACTIVITY_LOG_FILE_PATH);
const inactivityDuration = 5000; // 5 minute

let lastMouseMoveTime = Date.now(); // Track the last mouse move time
let lastKeyPressTime = Date.now();  // Track the last key press time


const loggedInUser = () => {
    const username = os.userInfo().username;
    return username;
};
// Check for keyboard inactivity
const checkKeyInactivity = () => {
    if (Date.now() - lastKeyPressTime >= inactivityDuration) {
        const username = loggedInUser();
        const logEntry = `\nUser ${username} Inactive: Did not notice any key press for 5 minute`;
        console.log('logEntry:',logEntry)
        logToFile(inactivityLogFilePath, logEntry);
        lastKeyPressTime = Date.now(); // Reset after logging to avoid repeated logs
    }
};

// Check for mouse inactivity
const checkMouseInactivity = () => {
    if (Date.now() - lastMouseMoveTime >= inactivityDuration) {
        const username = loggedInUser();
        const logEntry = `\nUser ${username} Inactive: Did not notice any mouse movement for 5 minute`;
        logToFile(inactivityLogFilePath, logEntry);
        lastMouseMoveTime = Date.now(); // Reset after logging to avoid repeated logs
    }
};

// Reset the keyboard inactivity timer
const resetKeyInactivityTimer = () => {
    lastKeyPressTime = Date.now();
};

// Reset the mouse inactivity timer
const resetMouseInactivityTimer = () => {
    lastMouseMoveTime = Date.now();
};

// Listen for keydown events
uIOhook.on('keydown', () => {
    resetKeyInactivityTimer(); // Reset inactivity timer on key press
});

// Listen for mouse movement events
uIOhook.on("mousemove", () => {
    resetMouseInactivityTimer(); // Reset inactivity timer on mouse move
});

// Start the hook to listen for events
uIOhook.start();


module.exports = { resetKeyInactivityTimer,resetMouseInactivityTimer,checkKeyInactivity,checkMouseInactivity};




