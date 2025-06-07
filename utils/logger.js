const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
const logFilePath = path.join(logDir, 'bot.log');

// S'assurer que le dossier logs existe
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  console.error(`[Logger] Échec création dossier logs : ${err.message}`);
}

/**
 * Formate la date en string lisible
 * @returns {string} - Timestamp au format ISO
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Écrit un message dans le fichier log et la console
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
    case 'INFO':
    default:
      console.log(logMessage);
  }

  // Écriture dans le fichier de logs
  fs.appendFile(logFilePath, logMessage + '\n', (err) => {
    if (err) {
      console.error(`[Logger] Erreur lors de l’écriture dans le fichier de log : ${err.message}`);
    }
  });
}

// Fonctions dédiées par niveau
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
