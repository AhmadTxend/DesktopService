require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const activeWin = require('active-win');
const screenshot = require('screenshot-desktop');
const puppeteer = require('puppeteer');

const { formatTime } = require('../utils/FormatTime');
const { logToFile } = require('../controllers/FileLogging');

const screenshotDir = path.resolve(__dirname, '../', 'screenshots');
const {formatTime,getFormattedDate,formatTimestamp} = require('../utils/Format');
const {AppCategories} = require('../Enums/Categories');
const {logToFile} = require('../controllers/FileLogging');

// const logFilePath = path.resolve(__dirname, '../', process.env.LOG_FILE_PATH);
const getActivityLogFilePath = () => {
  const formattedDate = getFormattedDate();
  return path.resolve(__dirname, `../Logs/activity_log_${formattedDate}.js`);
};
const logFilePath = getActivityLogFilePath();


if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

let lastWindow = null;  
let lastTabTitle = null; 
let lastTabURL = null; 
let lastSwitchTime = Date.now(); 

const getAppCategory = (appName) => {
  console.log('AppCategories:',AppCategories);
  console.log('appName:',appName);

  for (const [apps, category ] of Object.entries(AppCategories)) {
  console.log('apps:',apps);
      if (apps.includes(appName)) {
          return category;
      }
  }
  return "Uncategorized";
};

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
                const startTime = formatTimestamp(new Date(currentTime - timeSpent));
                const appCategory = getAppCategory(lastWindow.owner.name);

                const logEntry = {
                  user: username,
                  // timestamp: formatTimestamp(new Date()),
                  application: lastWindow.owner.name,
                  category: appCategory,
                  title: lastWindow.title,
                  duration: formatTime(timeSpent),
                  startTime: startTime,
                  endTime: formatTimestamp(new Date()),
              };
                logToFile(logFilePath, logEntry);                
                captureScreenshot(lastWindow.title);
            }

            lastWindow = window;
            lastTabTitle = currentTabTitle; 
            lastTabURL = currentTabURL; 
            lastSwitchTime = currentTime; 
        } 
        else if (currentTabTitle !== lastTabTitle || currentTabURL !== lastTabURL) { 
          const tabLogEntry = {
            user: username,
            timestamp: timestamp,  // Assuming `timestamp` is already formatted, if not, you can use `formatTimestamp(new Date())`
            application: window.owner.name,
            category: "browser",  // Set an appropriate category if you have this data
            title: currentTabTitle,
            url: currentTabURL,
            startTime: lastSwitchTime,  // Start time from the last switch
            endTime: currentTime,       // Current time for the end time
        };     
        
        logToFile(logFilePath, JSON.stringify(tabLogEntry) + '\n');
            captureScreenshot(currentTabTitle);

            lastTabTitle = currentTabTitle;
            lastTabURL = currentTabURL; 
            lastSwitchTime = currentTime; 
        }
      }
    }

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
