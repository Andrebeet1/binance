const { deleteLastMessages, trackMessage } = require('../utils/telegramHelpers');

module.exports = {
  name: 'start',
  description: 'Commande /start — message d’accueil avec clavier personnalisé',

  async execute(bot, chatId) {
    try {
      await deleteLastMessages(bot, chatId); // Supprime anciens

      const welcomeMessage = `👋 Bonjour !\n\nBienvenue sur Trading Bot 📈\nUtilise les boutons ci-dessous pour obtenir les signaux et infos trading.`;

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📊 Signal', callback_data: 'signal' }],
            [{ text: '📈 RSI', callback_data: 'rsi' }],
            [{ text: '💰 Buy / Sell', callback_data: 'buy_sell' }],
            [{ text: '❓ Aide', callback_data: 'help' }]
          ]
        }
      };

      const sent = await bot.sendMessage(chatId, welcomeMessage, keyboard);
      trackMessage(chatId, sent.message_id); // Suivre pour suppression future
    } catch (error) {
      console.error('Erreur dans /start :', error.message);
      await bot.sendMessage(chatId, '❌ Une erreur est survenue.');
    }
  }
};
