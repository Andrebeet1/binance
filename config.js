require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN?.trim() || '',
  BINANCE_API_KEY: process.env.BINANCE_API_KEY?.trim() || '',
  BINANCE_API_SECRET: process.env.BINANCE_API_SECRET?.trim() || '',
  APP_URL: process.env.APP_URL?.trim() || '',

  // Configuration personnalisée
  SIGNAL_DELAY_MS: parseInt(process.env.SIGNAL_DELAY_MS) || 30000, // 30s par défaut
};
