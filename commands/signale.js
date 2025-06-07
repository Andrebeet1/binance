const { createSignalKeyboard } = require('../utils/telegramHelpers');

module.exports = {
  name: 'signale',
  description: 'Affiche un signal de trading (BUY / SELL / NEUTRE)',

  async execute(bot, chatId) {
    try {
      const signals = ['BUY', 'SELL', 'NEUTRE'];
      const signal = signals[Math.floor(Math.random() * signals.length)];

      let signalText = '';

      switch (signal) {
        case 'BUY':
          signalText = '🟢🟢🟢*Signal d’achat recommandé (BUY)* 📈';
          break;
        case 'SELL':
          signalText = '🔴🔴🔴 *Signal de vente recommandé (SELL)* 📉';
          break;
        default:
          signalText = '⚪️⚪️⚪️ *Pas de signal clair (NEUTRE) pour le moment.*';
          break;
      }

      // Envoi du message avec mise en forme
      await bot.sendMessage(chatId, signalText, { parse_mode: 'Markdown' });

      // Envoi du clavier interactif
      const keyboard = createSignalKeyboard();
      await bot.sendMessage(chatId, 'Que souhaitez-vous faire ensuite ?', keyboard);

    } catch (error) {
      console.error('Erreur commande signale:', error.message);
      await bot.sendMessage(chatId, '❌ Une erreur est survenue lors de la génération du signal.');
    }
  }
};
