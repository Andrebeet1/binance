// utils/telegramHelpers.js

/**
 * Crée le clavier inline pour des actions ponctuelles (ex : signaux)
 */
function createSignalKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📈 Voir RSI', callback_data: 'rsi' },
          { text: '🟢 Acheter', callback_data: 'buy' },
          { text: '🔴 Vendre', callback_data: 'sell' }
        ],
        [
          { text: '❓ Aide', callback_data: 'help' }
        ]
      ]
    }
  };
}

/**
 * Crée le clavier principal classique, affiché en permanence sous le champ de texte
 */
function getMainKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '📊 RSI' }, { text: '📉 Signale' }],
        [{ text: '📘 Aide' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false // Le menu ne disparait jamais
    }
  };
}

// Historique temporaire des messages à supprimer (hors menu principal)
const messageHistory = new Map();
const HISTORY_LIMIT = 10;

/**
 * Enregistre un message à supprimer plus tard (sauf menu principal)
 * @param {number} chatId 
 * @param {number} messageId 
 */
function trackMessage(chatId, messageId) {
  if (!messageHistory.has(chatId)) {
    messageHistory.set(chatId, []);
  }
  const history = messageHistory.get(chatId);
  history.push(messageId);
  if (history.length > HISTORY_LIMIT) {
    messageHistory.set(chatId, history.slice(-HISTORY_LIMIT));
  }
}

/**
 * Supprime tous les messages enregistrés pour ce chat (sauf menu principal)
 * @param {TelegramBot} bot 
 * @param {number} chatId 
 */
async function deleteLastMessages(bot, chatId) {
  if (!messageHistory.has(chatId)) return;
  const messages = messageHistory.get(chatId);
  for (const messageId of messages) {
    try {
      await bot.deleteMessage(chatId, messageId);
    } catch (err) {
      if (!err.message.includes('message to delete not found')) {
        console.warn(`⚠️ Erreur suppression message : ${err.message}`);
      }
    }
  }
  messageHistory.set(chatId, []);
}

/**
 * Réinitialise l’interface utilisateur : supprime messages temporaires,
 * puis affiche le menu principal (onglets fixes)
 * @param {TelegramBot} bot 
 * @param {number} chatId 
 * @param {string} [text] Texte d’accueil ou de contexte (optionnel)
 */
async function resetUserInterface(bot, chatId, text = "Menu principal") {
  await deleteLastMessages(bot, chatId);
  // Affiche le menu principal (NE PAS tracker ce message !)
  await bot.sendMessage(chatId, text, getMainKeyboard());
}

module.exports = {
  createSignalKeyboard,
  getMainKeyboard,
  trackMessage,
  deleteLastMessages,
  resetUserInterface
};