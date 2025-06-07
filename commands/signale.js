const { createSignalMessage, createSignalKeyboard } = require('../utils/telegramHelpers');

module.exports = {
  name: 'signale',
  description: 'Affiche un signal de trading (BUY / SELL / NEUTRE)',

  async execute(ctx) {
    try {
      // Exemple simple : logique de signal à améliorer selon tes indicateurs
      // Ici on simule un signal aléatoire
      const signals = ['BUY', 'SELL', 'NEUTRE'];
      const signal = signals[Math.floor(Math.random() * signals.length)];

      // Message à envoyer selon le signal
      let signalText = '';
      let animation = null;

      switch (signal) {
        case 'BUY':
          signalText = '🟢 Signal d’achat recommandé (BUY) !';
          animation = 'animations/signal_up.gif';  // Chemin vers un gif animé "up"
          break;
        case 'SELL':
          signalText = '🔴 Signal de vente recommandé (SELL) !';
          animation = 'animations/signal_down.gif'; // Chemin vers un gif animé "down"
          break;
        default:
          signalText = '⚪️ Pas de signal clair (NEUTRE) pour le moment.';
          animation = null;
          break;
      }

      // Envoi de l’animation si disponible
      if (animation) {
        await ctx.replyWithAnimation({ source: animation }, { caption: signalText });
      } else {
        await ctx.reply(signalText);
      }

      // Boutons en dessous : Afficher RSI, Acheter, Vendre, Aide
      const keyboard = createSignalKeyboard();
      await ctx.reply('Que souhaitez-vous faire ensuite ?', keyboard);

    } catch (error) {
      console.error('Erreur commande signale:', error);
      await ctx.reply('❌ Une erreur est survenue lors de la génération du signal.');
    }
  }
};
