const { getRSI, getEMA } = require('../utils/indicators');
const { sendBuySellAnimation } = require('../utils/telegramHelpers');

module.exports = {
  name: 'buysell',
  description: 'Donne une recommandation BUY / SELL basée sur les indicateurs techniques',

  async execute(bot, chatId) {
    try {
      const symbol = 'BTCUSDT';
      const interval = '15m'; // Peut être modifié selon ton besoin

      // Appels aux indicateurs avec tous les paramètres nécessaires
      const rsi = await getRSI(symbol, interval, 14);
      const emaShort = await getEMA(symbol, interval, 9);
      const emaLong = await getEMA(symbol, interval, 21);

      if (rsi == null || emaShort == null || emaLong == null) {
        throw new Error("Un des indicateurs est retourné nul ou invalide.");
      }

      let signal = '';
      let emoji = '';
      let message = `📊 *Signal pour ${symbol} (${interval})*\n`;
      message += `🔹 RSI (14) : *${rsi}*\n`;
      message += `🔸 EMA 9 : *${emaShort}*\n`;
      message += `🔸 EMA 21 : *${emaLong}*\n\n`;

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

      // Envoi de l’animation et du message
      await sendBuySellAnimation(bot, chatId, signal);
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Erreur Buy/Sell :', error.message);
      await bot.sendMessage(chatId, '❌ Erreur lors de la génération du signal BUY/SELL.');
    }
  }
};
