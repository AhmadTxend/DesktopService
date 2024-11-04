

const { logUserActivity } = require('./controllers/UserActivityLog');
const { resetKeyInactivityTimer,resetMouseInactivityTimer,checkKeyInactivity,checkMouseInactivity } = require('./controllers/UserInActivityLog');



  
resetKeyInactivityTimer();
resetMouseInactivityTimer();
setInterval(checkKeyInactivity, 1000);   // Check keyboard inactivity every second
setInterval(checkMouseInactivity, 1000); // Check mouse inactivity every second

// Logging the user window switching 
setInterval(logUserActivity, 1000);
