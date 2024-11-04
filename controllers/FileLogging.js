
const fs = require('fs');
const path = require('path');


// const logToFile = (logFilePath, logEntry) => {
//     fs.appendFile(logFilePath, logEntry, (err) => {
//       if (err) { 
//         console.error('Error logging entry:', err);
//       } else {
//         console.log('Entry logged:', logEntry.trim());
//       }
//     });
// };


const logToFile = (logFilePath, logEntry) => {

  console.log('logFilePath:',logFilePath);
  console.log('logEntry:',logEntry);
  let logs = [];
  // Try to read existing data from the JSON file
  try {
      if (fs.existsSync(logFilePath)) {
          const data = fs.readFileSync(logFilePath, 'utf8');
          logs = JSON.parse(data); // Parse the JSON data
      }
  } catch (err) {
      console.error('Error reading or parsing log file. Initializing as empty array:', err);
      logs = []; // Reset to empty array if JSON is invalid
  }

  // Append the new log entry
  logs.push(logEntry);

  // Write the updated logs back to the JSON file
  try {
      fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
      console.log('Entry logged:', logEntry);
  } catch (writeErr) {
      console.error('Error writing log entry to file:', writeErr);
  }
};


module.exports={logToFile}