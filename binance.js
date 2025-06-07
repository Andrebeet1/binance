const axios = require('axios');
const WebSocket = require('ws');
const { calculateRSI } = require('./utils/indicators');

const BASE_URL = 'https://api.binance.com';
const SOCKET_BASE = 'wss://stream.binance.com:9443/ws';

let priceData = [];

/**
 * Récupère les dernières bougies (candlesticks) de Binance en REST
 */
async function getCandleData(symbol = 'BTCUSDT', interval = '1m', limit = 100) {
  try {
    const res = await axios.get(`${BASE_URL}/api/v3/klines`, {
      params: {
        symbol,
        interval,
        limit,
      },
    });

    // On extrait les prix de clôture
    const closes = res.data.map(candle => parseFloat(candle[4]));
    return closes;
  } catch (err) {
    console.error('Erreur REST Binance:', err.message);
    return [];
  }
}

/**
 * Démarre le WebSocket Binance pour suivre le prix en temps réel
 */
function startPriceStream(symbol = 'btcusdt', onPriceUpdate) {
  const ws = new WebSocket(`${SOCKET_BASE}/${symbol}@kline_1m`);

  ws.on('message', msg => {
    const data = JSON.parse(msg);
    const close = parseFloat(data.k.c); // prix de clôture

    priceData.push(close);
    if (priceData.length > 100) priceData.shift(); // Limite à 100

    const rsi = calculateRSI(priceData);
    onPriceUpdate(close, rsi);
  });

  ws.on('error', err => {
    console.error('WebSocket Binance Error:', err.message);
  });

  ws.on('close', () => {
    console.warn('WebSocket fermé. Reconnexion...');
    setTimeout(() => startPriceStream(symbol, onPriceUpdate), 5000);
  });
}

module.exports = {
  getCandleData,
  startPriceStream,
};
