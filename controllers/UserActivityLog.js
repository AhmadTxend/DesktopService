require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const activeWin = require('active-win');
const screenshot = require('screenshot-desktop');
const puppeteer = require('puppeteer');

const { formatTime } = require('../utils/FormatTime');
const { logToFile } = require('../controllers/FileLogging');

const logFilePath = path.resolve(__dirname, '../', process.env.LOG_FILE_PATH);
const screenshotDir = path.resolve(__dirname, '../', 'screenshots');

if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

let lastWindow = null;  
let lastTabTitle = null; 
let lastTabURL = null; 
let lastSwitchTime = Date.now(); 

const logUserActivity = async () => {
    const currentTime = Date.now();
    const username = os.userInfo().username;
    const timestamp = new Date().toLocaleString();
    const window = await activeWin();

    if (window) {
        const currentTabTitle = window.title;
        const currentTabURL = await getCurrentTabURL(); 

        if (!lastWindow || window.id !== lastWindow.id) {
            if (lastWindow) {
                const timeSpent = currentTime - lastSwitchTime; 
                const durationLogEntry = `User: ${username}, TimeStamp: ${new Date(lastSwitchTime).toLocaleString()}, Application: ${lastWindow.owner.name}, Title: ${lastWindow.title}, Duration: ${formatTime(timeSpent)}\n`;
                logToFile(logFilePath, durationLogEntry);
                
                captureScreenshot(lastWindow.title);
            }

            lastWindow = window;
            lastTabTitle = currentTabTitle; 
            lastTabURL = currentTabURL; 
            lastSwitchTime = currentTime; 
        } 
        else if (currentTabTitle !== lastTabTitle || currentTabURL !== lastTabURL) { 
            const tabLogEntry = `User: ${username}, TimeStamp: ${timestamp}, Application: ${window.owner.name}, Switched to Tab: ${currentTabTitle}, URL: ${currentTabURL}\n`;
            logToFile(logFilePath, tabLogEntry);

            captureScreenshot(currentTabTitle);

            lastTabTitle = currentTabTitle;
            lastTabURL = currentTabURL; 
            lastSwitchTime = currentTime; 
        }
    }
};

const getCurrentTabURL = async () => {
    let url = '';
    try {
        const browser = await puppeteer.connect({ 
            browserURL: 'http://localhost:9222' 
        });
        const pages = await browser.pages(); 
        const activePage = pages.find(page => page.isVisible()); 

        if (activePage) {
            url = await activePage.url(); 
        }

        await browser.disconnect(); 
    } catch (error) {
        console.error('Error fetching current tab URL:', error);
    }
    return url; 
};

const captureScreenshot = (context) => {
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

module.exports = { logUserActivity };
