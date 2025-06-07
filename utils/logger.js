const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '..', 'logs', 'bot.log');

// S'assurer que le dossier logs existe
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

/**
 * Formate la date en string lisible
 * @returns {string} - Timestamp au format ISO local
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Ecrit un message dans le fichier log et console
 * @param {'INFO'|'ERROR'|'WARN'} level 
 * @param {string} message 
 */
function log(level, message) {
  const logMessage = `[${getTimestamp()}] [${level}] ${message}`;
  
  // Écriture dans la console
  switch (level) {
    case 'ERROR':
      console.error(logMessage);
      break;
    case 'WARN':
      console.warn(logMessage);
      break;
    default:
      console.log(logMessage);
  }
  
  // Append dans le fichier de logs (async)
  fs.appendFile(logFilePath, logMessage + '\n', (err) => {
    if (err) console.error(`[Logger] Erreur écriture fichier log: ${err.message}`);
  });
}

// Fonctions spécifiques par niveau
function info(message) {
  log('INFO', message);
}

function error(message) {
  log('ERROR', message);
}

function warn(message) {
  log('WARN', message);
}

module.exports = {
  info,
  error,
  warn,
};
