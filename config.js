require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  BINANCE_API_KEY: process.env.BINANCE_API_KEY || '',
  BINANCE_API_SECRET: process.env.BINANCE_API_SECRET || '',
  // Tu peux ajouter d'autres configs comme le délai entre signaux, etc.
  SIGNAL_DELAY_MS: process.env.SIGNAL_DELAY_MS || 30000,
};
