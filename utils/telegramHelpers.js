// utils/telegramHelpers.js
const fs = require('fs');

/**
 * Génère le clavier inline pour les signaux (RSI, Acheter, Vendre, Aide)
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
 * Génère le clavier principal classique (sous le champ de texte)
 */
function getMainKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '📊 RSI' }, { text: '📉 Signale' }],
        [{ text: '📘 Aide' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false // Le clavier reste affiché
    }
  };
}

// Historique temporaire des messages à supprimer
const messageHistory = new Map();
const MESSAGE_HISTORY_LIMIT = 10; // Peut être ajusté

/**
 * Enregistre un message à supprimer plus tard
 * @param {number} chatId 
 * @param {number} messageId 
 */
function trackMessage(chatId, messageId) {
  if (!messageHistory.has(chatId)) {
    messageHistory.set(chatId, []);
  }
  const history = messageHistory.get(chatId);
  history.push(messageId);
  // Limite l’historique à MESSAGE_HISTORY_LIMIT messages par chat
  if (history.length > MESSAGE_HISTORY_LIMIT) {
    messageHistory.set(chatId, history.slice(-MESSAGE_HISTORY_LIMIT));
  }
}

/**
 * Supprime tous les messages enregistrés pour ce chat
 * puis vide l’historique
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
      // Ignore si le message n’existe plus, loggue le reste
      if (!err.message.includes('message to delete not found')) {
        console.warn(`⚠️ Erreur suppression message : ${err.message}`);
      }
    }
  }
  messageHistory.set(chatId, []);
}

/**
 * Supprime l’historique et affiche un nouveau message avec clavier
 * @param {TelegramBot} bot 
 * @param {number} chatId 
 * @param {string} text 
 * @returns {Promise}
 */
async function resetAndSendMainKeyboard(bot, chatId, text) {
  await deleteLastMessages(bot, chatId);
  const sent = await bot.sendMessage(chatId, text, getMainKeyboard());
  trackMessage(chatId, sent.message_id);
  return sent;
}

module.exports = {
  createSignalKeyboard,
  getMainKeyboard,
  trackMessage,
  deleteLastMessages,
  resetAndSendMainKeyboard // Nouvelle fonction pratique
};