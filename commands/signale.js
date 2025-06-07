const fs = require('fs');
const path = require('path');
const { createSignalKeyboard } = require('../utils/telegramHelpers');

module.exports = {
  name: 'signale',
  description: 'Affiche un signal de trading (BUY / SELL / NEUTRE)',

  async execute(bot, chatId) {
    try {
      const signals = ['BUY', 'SELL', 'NEUTRE'];
      const signal = signals[Math.floor(Math.random() * signals.length)];

      let signalText = '';
      let animationPath = '';

      switch (signal) {
        case 'BUY':
          signalText = '🟢 Signal d’achat recommandé (BUY) !';
          animationPath = path.join(__dirname, '../animations/signal_up.gif');
          break;
        case 'SELL':
          signalText = '🔴 Signal de vente recommandé (SELL) !';
          animationPath = path.join(__dirname, '../animations/signal_down.gif');
          break;
        default:
          signalText = '⚪️ Pas de signal clair (NEUTRE) pour le moment.';
          animationPath = null;
          break;
      }

      // Envoi de l’animation si disponible
      if (animationPath && fs.existsSync(animationPath)) {
        await bot.sendAnimation(chatId, fs.createReadStream(animationPath), {
          caption: signalText
        });
      } else {
        await bot.sendMessage(chatId, signalText);
      }

      // Envoi du clavier
      const keyboard = createSignalKeyboard();
      await bot.sendMessage(chatId, 'Que souhaitez-vous faire ensuite ?', keyboard);

    } catch (error) {
      console.error('Erreur commande signale:', error.message);
      await bot.sendMessage(chatId, '❌ Une erreur est survenue lors de la génération du signal.');
    }
  }
};
