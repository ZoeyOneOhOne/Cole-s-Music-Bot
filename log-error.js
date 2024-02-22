const fs = require('fs');
const path = require('path');

function logErrorToFile(error, interaction) {
    try {
        const today = new Date();
        const formattedDate = today.toLocaleDateString(); // e.g., "09/18/2023" (format may vary depending on your system's locale)

        // Construct the log message
        const logMessage = `[${formattedDate}] Error: ${error}, User: ${user}, Interaction information: ${interaction}\n`;

        // Define the path to the log file
        const logFilePath = path.join(__dirname, 'error.log');

        // Append the log message to the file
        fs.appendFileSync(logFilePath, logMessage);

        console.log('Error logged to file successfully.');
    } catch (error) {
        console.error('An error occurred while logging error to file:', error);
    }
}

module.exports = { logErrorToFile };