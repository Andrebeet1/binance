const axios = require('axios');

// Simple cache pour éviter les appels multiples identiques
const priceCache = {};

/**
 * Récupère les prix de clôture avec gestion d'erreurs et mise en cache.
 */
async function getClosingPrices(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
  const cacheKey = `${symbol}_${interval}_${limit}`;
  if (priceCache[cacheKey]) {
    return priceCache[cacheKey];
  }
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  try {
    const response = await axios.get(url);
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('Aucune donnée reçue de Binance');
    }
    const prices = response.data.map(candle => parseFloat(candle[4]));
    priceCache[cacheKey] = prices;
    return prices;
  } catch (error) {
    console.error(`[getClosingPrices] Erreur pour ${symbol} : ${error.message}`);
    return [];
  }
}

// EMA
function calculateEMA(prices, period) {
  if (!Array.isArray(prices) || prices.length < period) return [];
  const k = 2 / (period + 1);
  const emaArray = new Array(prices.length).fill(undefined);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emaArray[period - 1] = ema;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    emaArray[i] = ema;
  }
  return emaArray;
}

// RSI
function calculateRSI(prices, period = 14) {
  if (!Array.isArray(prices) || prices.length <= period) return [];
  const rsiArray = new Array(prices.length).fill(undefined);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsiArray[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsiArray[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return rsiArray;
}

// MACD
function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  const macd = prices.map((_, i) =>
    (emaFast[i] !== undefined && emaSlow[i] !== undefined)
      ? emaFast[i] - emaSlow[i]
      : undefined
  );
  const validMACD = macd.filter(v => v !== undefined);
  const signal = calculateEMA(validMACD, signalPeriod);
  const histogram = macd.map((value, i) =>
    value !== undefined && signal[i] !== undefined
      ? value - signal[i]
      : undefined
  );
  return { macd, signal, histogram };
}

// Obtenir le dernier RSI avec gestion automatique du limit
async function getRSI(symbol = 'BTCUSDT', period = 14, interval = '1h', limit) {
  // On s'assure de prendre assez de valeurs pour un RSI fiable
  const minLimit = period + 20; // +20 pour la stabilité du calcul
  limit = (limit === undefined || limit < minLimit) ? minLimit : limit;
  const prices = await getClosingPrices(symbol, interval, limit);
  if (!prices || prices.length <= period) {
    console.error(`[getRSI] Données insuffisantes : récupéré ${prices.length}, requis > ${period}`);
    return null;
  }
  const rsiArray = calculateRSI(prices, period);
  const latestRSI = rsiArray.filter(v => v !== undefined).pop();
  return latestRSI;
}

// Obtenir le dernier EMA avec gestion automatique du limit
async function getEMA(symbol = 'BTCUSDT', period = 9, interval = '1h', limit) {
  const minLimit = period + 10; // +10 pour la stabilité du calcul
  limit = (limit === undefined || limit < minLimit) ? minLimit : limit;
  const prices = await getClosingPrices(symbol, interval, limit);
  if (!prices || prices.length <= period) {
    console.error(`[getEMA] Données insuffisantes : récupéré ${prices.length}, requis > ${period}`);
    return null;
  }
  const emaArray = calculateEMA(prices, period);
  const latestEMA = emaArray.filter(v => v !== undefined).pop();
  return latestEMA;
}

// Signal de trading intelligent
function getSmartSignal(prices) {
  const rsiPeriod = 14;
  const emaPeriod = 20;
  const rsiArray = calculateRSI(prices, rsiPeriod);
  const emaArray = calculateEMA(prices, emaPeriod);
  const { macd, signal } = calculateMACD(prices);

  const latestRSI = rsiArray.filter(v => v !== undefined).pop();
  const latestEMA = emaArray.filter(v => v !== undefined).pop();
  const lastPrice = prices[prices.length - 1];
  const latestMACD = macd.filter(v => v !== undefined).pop();
  const latestSignal = signal.filter(v => v !== undefined).pop();

  let decision = 'HOLD', confidence = 0.5, reason = 'Pas de signal clair';

  if (latestRSI !== undefined && latestEMA !== undefined && latestMACD !== undefined && latestSignal !== undefined) {
    if (lastPrice > latestEMA && latestRSI < 30 && latestMACD > latestSignal) {
      decision = 'BUY';
      confidence = 0.9;
      reason = 'Tendance haussière, RSI bas, MACD haussier';
    } else if (lastPrice < latestEMA && latestRSI > 70 && latestMACD < latestSignal) {
      decision = 'SELL';
      confidence = 0.9;
      reason = 'Tendance baissière, RSI haut, MACD baissier';
    }
  }
  return { signal: decision, confidence, reason };
}

module.exports = {
  getClosingPrices,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  getRSI,
  getEMA,
  getSmartSignal,
};