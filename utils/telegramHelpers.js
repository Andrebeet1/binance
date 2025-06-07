// utils/telegramHelpers.js
const fs = require('fs');

/**
 * Clavier inline pour les signaux (RSI, Acheter, Vendre, Aide)
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
 * Clavier classique (keyboard) pour le menu principal
 */
function getMainKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '📊 RSI' }, { text: '📉 Signale' }],
        [{ text: '📘 Aide' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
}

// Historique temporaire des messages à supprimer
const messageHistory = new Map();

/**
 * Enregistre un message envoyé pour suppression future
 * @param {number} chatId 
 * @param {number} messageId 
 */
function trackMessage(chatId, messageId) {
  if (!messageHistory.has(chatId)) {
    messageHistory.set(chatId, []);
  }
  messageHistory.get(chatId).push(messageId);

  // Garder seulement les 10 derniers
  if (messageHistory.get(chatId).length > 10) {
    messageHistory.set(chatId, messageHistory.get(chatId).slice(-10));
  }
}

/**
 * Supprime les derniers messages envoyés au chat
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

module.exports = {
  createSignalKeyboard,
  getMainKeyboard,
  trackMessage,
  deleteLastMessages,
};
