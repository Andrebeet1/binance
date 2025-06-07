const { Markup } = require('telegraf');
const { clearPreviousMessages } = require('../utils/telegramHelpers');

module.exports = {
  name: 'start',
  description: 'Commande /start — message d’accueil avec clavier personnalisé',
  
  async execute(ctx) {
    try {
      // Effacer les messages précédents pour une conversation propre
      await clearPreviousMessages(ctx);

      const welcomeMessage = `👋 Bonjour ${ctx.from.first_name}!\n\n` +
        `Bienvenue sur Trading Bot 📈\n` +
        `Utilise les boutons ci-dessous pour obtenir les signaux et infos trading.`;

      // Clavier inline avec les commandes principales
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📊 Signal', 'signal')],
        [Markup.button.callback('📈 RSI', 'rsi')],
        [Markup.button.callback('💰 Buy / Sell', 'buySell')],
        [Markup.button.callback('❓ Aide', 'help')]
      ]);

      await ctx.reply(welcomeMessage, keyboard);
    } catch (error) {
      console.error('Erreur dans la commande /start:', error);
      await ctx.reply('Désolé, une erreur est survenue. Veuillez réessayer plus tard.');
    }
  }
};
