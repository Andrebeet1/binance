/**
 * Calcul de la moyenne mobile exponentielle (EMA)
 * @param {Array<number>} prices - Liste des prix (fermeture)
 * @param {number} period - Période de l'EMA
 * @returns {Array<number>} - Liste des valeurs EMA
 */
function calculateEMA(prices, period) {
    const k = 2 / (period + 1);
    let emaArray = [];
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
   * @param {number} period - Période du RSI (classiquement 14)
   * @returns {Array<number>} - Liste des valeurs RSI
   */
  function calculateRSI(prices, period = 14) {
    let gains = 0, losses = 0;
    let rsiArray = [];
  
    for (let i = 1; i <= period; i++) {
      let diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }
  
    let avgGain = gains / period;
    let avgLoss = losses / period;
    let rs = avgGain / avgLoss;
    rsiArray[period] = 100 - 100 / (1 + rs);
  
    for (let i = period + 1; i < prices.length; i++) {
      let diff = prices[i] - prices[i - 1];
      let gain = diff > 0 ? diff : 0;
      let loss = diff < 0 ? -diff : 0;
  
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
  
      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiArray[i] = 100 - 100 / (1 + rs);
    }
  
    return rsiArray;
  }
  
  /**
   * Calcul du MACD (Moving Average Convergence Divergence)
   * @param {Array<number>} prices - Liste des prix (fermeture)
   * @param {number} fastPeriod - Période EMA rapide (ex: 12)
   * @param {number} slowPeriod - Période EMA lente (ex: 26)
   * @param {number} signalPeriod - Période de la ligne signal (ex: 9)
   * @returns {Object} - { macd: [], signal: [], histogram: [] }
   */
  function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = calculateEMA(prices, fastPeriod);
    const emaSlow = calculateEMA(prices, slowPeriod);
    let macd = [];
    for (let i = 0; i < prices.length; i++) {
      macd[i] = (emaFast[i] || 0) - (emaSlow[i] || 0);
    }
    const signal = calculateEMA(macd.filter(v => v !== undefined), signalPeriod);
  
    let histogram = [];
    for (let i = 0; i < macd.length; i++) {
      histogram[i] = (macd[i] || 0) - (signal[i] || 0);
    }
  
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
  
    if (latestRSI < 30 && latestMACD > latestSignal) {
      return 'BUY';
    } else if (latestRSI > 70 && latestMACD < latestSignal) {
      return 'SELL';
    } else {
      return 'HOLD';
    }
  }
  
  module.exports = {
    calculateEMA,
    calculateRSI,
    calculateMACD,
    getBuySellSignal,
  };
  