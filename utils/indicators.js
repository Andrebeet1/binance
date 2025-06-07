/**
 * Calcul de la moyenne mobile exponentielle (EMA)
 * @param {Array<number>} prices - Liste des prix (fermeture)
 * @param {number} period - Période de l'EMA
 * @returns {Array<number>} - Liste des valeurs EMA
 */
function calculateEMA(prices, period) {
  if (prices.length < period) return [];

  const k = 2 / (period + 1);
  const emaArray = new Array(prices.length).fill(undefined);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period; // SMA initiale

  emaArray[period - 1] = ema;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    emaArray[i] = ema;
  }

  return emaArray;
}

/**
 * Calcul du RSI (Relative Strength Index)
 * @param {Array<number>} prices - Liste des prix (fermeture)
 * @param {number} period - Période du RSI (par défaut 14)
 * @returns {Array<number>} - Liste des valeurs RSI
 */
function calculateRSI(prices, period = 14) {
  if (prices.length <= period) return [];

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

/**
 * Calcul du MACD (Moving Average Convergence Divergence)
 * @param {Array<number>} prices - Liste des prix (fermeture)
 * @param {number} fastPeriod - Période EMA rapide (par défaut 12)
 * @param {number} slowPeriod - Période EMA lente (par défaut 26)
 * @param {number} signalPeriod - Période de la ligne signal (par défaut 9)
 * @returns {Object} - { macd: [], signal: [], histogram: [] }
 */
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

/**
 * Signal d'achat / vente simple basé sur RSI et MACD
 * @param {Array<number>} prices - Liste des prix
 * @returns {string} - 'BUY', 'SELL' ou 'HOLD'
 */
function getBuySellSignal(prices) {
  const rsiPeriod = 14;
  const rsiArray = calculateRSI(prices, rsiPeriod);
  const latestRSI = rsiArray[rsiArray.length - 1];

  const { macd, signal } = calculateMACD(prices);
  const latestMACD = macd[macd.length - 1];
  const latestSignal = signal[signal.length - 1];

  if (
    latestRSI !== undefined &&
    latestMACD !== undefined &&
    latestSignal !== undefined
  ) {
    if (latestRSI < 30 && latestMACD > latestSignal) return 'BUY';
    if (latestRSI > 70 && latestMACD < latestSignal) return 'SELL';
  }

  return 'HOLD';
}

module.exports = {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  getBuySellSignal,
};
