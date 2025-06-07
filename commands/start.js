const { deleteLastMessages } = require('../utils/telegramHelpers');

module.exports = {
  name: 'start',
  description: 'Commande /start — message d’accueil avec clavier personnalisé',

  async execute(bot, chatId) {
    try {
      // Supprimer les anciens messages
      await deleteLastMessages(bot, chatId);

      const welcomeMessage = `👋 Bonjour !\n\n` +
        `Bienvenue sur Trading Bot 📈\n` +
        `Utilise les boutons ci-dessous pour obtenir les signaux et infos trading.`;

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

      await bot.sendMessage(chatId, welcomeMessage, keyboard);
    } catch (error) {
      console.error('Erreur dans /start :', error.message);
      await bot.sendMessage(chatId, '❌ Une erreur est survenue.');
    }
  }
};
