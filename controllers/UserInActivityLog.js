const {logToFile} = require('../controllers/FileLogging');
const { uIOhook, UiohookKey } = require('uiohook-napi');
require('dotenv').config();
const path = require('path');
const os = require('os');
const {formatDuration,formatTimestamp,getFormattedDate} = require('../utils/Format');


const inactivityDuration = 1* 60 * 1000; // 1 minute
// const inactivityDuration = 5000; // 5 second


let lastMouseMoveTime = Date.now(); // Track the last mouse move time
let lastKeyPressTime = Date.now();  // Track the last key press time


 
const getInactivityLogFilePath = () => {
    const formattedDate = getFormattedDate();
    return path.resolve(__dirname, `../Logs/inactivity_log_${formattedDate}.js`);
};
const inactivityLogFilePath = getInactivityLogFilePath();

const loggedInUser = () => {
    const username = os.userInfo().username;
    return username;
};

const checkKeyInactivity = () => {
    if (Date.now() - lastKeyPressTime >= inactivityDuration) {
        const logEntry = {
            user: loggedInUser(),
            event: "keyboard inactivity",
            message: `Did not notice any key Press for ${formatDuration(inactivityDuration)}`,
            timestamp: formatTimestamp(new Date()),
        };
        logToFile(inactivityLogFilePath, logEntry);
        lastKeyPressTime = Date.now(); // Reset after logging to avoid repeated logs
    }
};

const checkMouseInactivity = () => {
    if (Date.now() - lastMouseMoveTime >= inactivityDuration) {
        const logEntry = {
            user: loggedInUser(),
            event: "mouse inactivity",
            message: `Did not notice any mouse movement for ${formatDuration(inactivityDuration)}`,
            timestamp: formatTimestamp(new Date()),
        };
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




