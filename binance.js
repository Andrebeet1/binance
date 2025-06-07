const axios = require('axios');
const WebSocket = require('ws');
const { calculateRSI } = require('./utils/indicators');

const BASE_URL = 'https://api.binance.com';
const SOCKET_BASE = 'wss://stream.binance.com:9443/ws';

let priceData = [];

/**
 * Récupère les dernières bougies (candlesticks) de Binance via REST API
 * @param {string} symbol - Exemple : 'BTCUSDT'
 * @param {string} interval - Exemple : '1m', '15m', '1h'
 * @param {number} limit - Nombre de bougies à récupérer (max 1000)
 * @returns {Promise<number[]>} - Liste des prix de clôture
 */
async function getCandleData(symbol = 'BTCUSDT', interval = '1m', limit = 100) {
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/klines`, {
      params: { symbol, interval, limit },
    });

    // Extraction des prix de clôture (index 4 dans les bougies)
    const closes = response.data.map(candle => parseFloat(candle[4]));
    return closes;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des bougies :', error.message);
    return [];
  }
}

/**
 * Démarre un WebSocket Binance pour recevoir le prix en temps réel
 * @param {string} symbol - Exemple : 'btcusdt'
 * @param {(price: number, rsi: number|null) => void} onPriceUpdate - Callback
 */
function startPriceStream(symbol = 'btcusdt', onPriceUpdate) {
  const ws = new WebSocket(`${SOCKET_BASE}/${symbol}@kline_1m`);

  ws.on('open', () => {
    console.log(`✅ WebSocket ouvert pour ${symbol}`);
  });

  ws.on('message', message => {
    try {
      const data = JSON.parse(message);

      if (data && data.k && data.k.x) { // k.x = fin de bougie (close)
        const closePrice = parseFloat(data.k.c);
        priceData.push(closePrice);

        // Garder seulement les 100 dernières valeurs
        if (priceData.length > 100) {
          priceData.shift();
        }

        const rsi = priceData.length >= 15 ? calculateRSI(priceData) : null;
        onPriceUpdate(closePrice, rsi);
      }
    } catch (error) {
      console.error('❌ Erreur parsing WebSocket message :', error.message);
    }
  });

  ws.on('error', err => {
    console.error('❌ WebSocket Binance erreur :', err.message);
  });

  ws.on('close', () => {
    console.warn('⚠️ WebSocket fermé. Tentative de reconnexion dans 5s...');
    setTimeout(() => startPriceStream(symbol, onPriceUpdate), 5000);
  });
}

module.exports = {
  getCandleData,
  startPriceStream,
};
