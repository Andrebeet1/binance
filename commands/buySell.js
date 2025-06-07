const { getRSI, getEMA } = require('../utils/indicators');
const { sendBuySellAnimation } = require('../utils/telegramHelpers');

module.exports = {
  name: 'buysell',
  description: 'Donne une recommandation BUY / SELL basée sur les indicateurs techniques',

  async execute(bot, chatId) {
    try {
      const symbol = 'BTCUSDT';
      const rsi = await getRSI(symbol, 14);
      const emaShort = await getEMA(symbol, 9);
      const emaLong = await getEMA(symbol, 21);

      let signal = '';
      let emoji = '';
      let message = `📊 *Signal pour ${symbol}*\n`;
      message += `🔹 RSI (14) : *${rsi.toFixed(2)}*\n`;
      message += `🔸 EMA 9 : *${emaShort.toFixed(2)}*\n`;
      message += `🔸 EMA 21 : *${emaLong.toFixed(2)}*\n\n`;

      // Logique du signal
      if (rsi < 30 && emaShort > emaLong) {
        signal = 'BUY';
        emoji = '🟢';
        message += `${emoji} *Signal d’achat détecté* : marché survendu et croisement EMA positif.`;
      } else if (rsi > 70 && emaShort < emaLong) {
        signal = 'SELL';
        emoji = '🔴';
        message += `${emoji} *Signal de vente détecté* : marché suracheté et croisement EMA négatif.`;
      } else {
        signal = 'WAIT';
        emoji = '⚪';
        message += `${emoji} *Pas de signal clair pour le moment.*`;
      }

      // Envoyer animation (si disponible) et message
      await sendBuySellAnimation(bot, chatId, signal);
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Erreur Buy/Sell :', error);
      await bot.sendMessage(chatId, '❌ Erreur lors de la génération du signal BUY/SELL.');
    }
  }
};
