const fs = require('fs');

// Création d’un clavier inline pour la commande /signale
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

// Création d’un clavier classique au démarrage (/start)
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

// Fonction pour supprimer un message après X secondes
async function autoDeleteMessage(ctx, messageId, delay = 10000) {
  setTimeout(() => {
    ctx.telegram.deleteMessage(ctx.chat.id, messageId).catch((err) => {
      console.warn('Erreur lors de la suppression du message :', err.message);
    });
  }, delay);
}

// Fonction d’envoi avec suppression automatique (message temporaire)
async function replyAndDelete(ctx, text, delay = 7000) {
  const sent = await ctx.reply(text);
  autoDeleteMessage(ctx, sent.message_id, delay);
}

module.exports = {
  createSignalKeyboard,
  getMainKeyboard,
  autoDeleteMessage,
  replyAndDelete
};
