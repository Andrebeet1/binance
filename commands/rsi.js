const { getRSI } = require('../utils/indicators');
const { sendRSIAnimation } = require('../utils/telegramHelpers');

module.exports = {
  name: 'rsi',
  description: 'Affiche l’indicateur RSI pour la paire BTC/USDT',
  
  async execute(bot, chatId) {
    try {
      const rsiValue = await getRSI('BTCUSDT', 14);

      let message = `💹 *RSI (BTC/USDT)*\n`;
      message += `Valeur actuelle : *${rsiValue.toFixed(2)}*\n\n`;

      if (rsiValue < 30) {
        message += `🔵 *Survendu* → Possibilité d’achat*`;
      } else if (rsiValue > 70) {
        message += `🔴 *Suracheté* → Risque de baisse / vente*`;
      } else {
        message += `🟢 *Zone neutre* → Attendre confirmation*`;
      }

      // Envoi de l’animation si disponible
      await sendRSIAnimation(bot, chatId);

      // Envoi du message RSI avec Markdown
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Erreur RSI :', error.message);
      await bot.sendMessage(chatId, '❌ Une erreur est survenue lors du calcul du RSI.');
    }
  }
};
