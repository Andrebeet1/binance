const { getRSI } = require('../utils/indicators');
const { sendRSIAnimation } = require('../utils/telegramHelpers');

module.exports = {
  name: 'rsi',
  description: 'Affiche l’indicateur RSI pour la paire BTC/USDT',
  
  async execute(ctx) {
    try {
      // Obtenir la valeur RSI actuelle (ex. sur 14 périodes)
      const rsiValue = await getRSI('BTCUSDT', 14);

      let message = `💹 *RSI (BTC/USDT)*\n`;
      message += `Valeur actuelle : *${rsiValue.toFixed(2)}*\n\n`;

      // Analyse basique
      if (rsiValue < 30) {
        message += `🔵 *Survendu* → Possibilité d’achat`;
      } else if (rsiValue > 70) {
        message += `🔴 *Suracheté* → Risque de baisse / vente`;
      } else {
        message += `🟢 *Zone neutre* → Attendre confirmation`;
      }

      // Envoyer une animation et le message
      await sendRSIAnimation(ctx);
      await ctx.replyWithMarkdownV2(message);

    } catch (error) {
      console.error('Erreur RSI :', error);
      await ctx.reply('❌ Une erreur est survenue lors du calcul du RSI.');
    }
  }
};
