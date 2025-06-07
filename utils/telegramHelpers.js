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

/**
 * Supprime automatiquement un message après un délai donné
 * @param {Object} ctx - Contexte Telegraf
 * @param {number} messageId - ID du message à supprimer
 * @param {number} delay - Délai en millisecondes (par défaut 10s)
 */
function autoDeleteMessage(ctx, messageId, delay = 10000) {
  setTimeout(() => {
    ctx.telegram.deleteMessage(ctx.chat.id, messageId).catch(err => {
      console.warn('⚠️ Erreur suppression message :', err.message);
    });
  }, delay);
}

/**
 * Envoie un message temporaire qui s’autodétruit après un délai
 * @param {Object} ctx - Contexte Telegraf
 * @param {string} text - Message à envoyer
 * @param {number} delay - Durée avant suppression (ms)
 */
async function replyAndDelete(ctx, text, delay = 7000) {
  try {
    const sent = await ctx.reply(text);
    autoDeleteMessage(ctx, sent.message_id, delay);
  } catch (err) {
    console.error('❌ Erreur replyAndDelete :', err.message);
  }
}

module.exports = {
  createSignalKeyboard,
  getMainKeyboard,
  autoDeleteMessage,
  replyAndDelete
};
