
const { logUserActivity } = require('./controllers/UserActivityLog');
const { resetKeyInactivityTimer,resetMouseInactivityTimer,checkActivity } = require('./controllers/UserInActivityLog');
 
resetKeyInactivityTimer();
resetMouseInactivityTimer();
setInterval(checkActivity, 1000);  
 
// Logging the user window switching
setInterval(logUserActivity, 1000);



