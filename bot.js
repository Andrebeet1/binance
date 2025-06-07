require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

const startCommand = require('./commands/start');
const helpCommand = require('./commands/help');
const rsiCommand = require('./commands/rsi');
const buySellCommand = require('./commands/buySell');
const signaleCommand = require('./commands/signale');

const { deleteLastMessages } = require('./utils/telegramHelpers');
const logger = require('./utils/logger');

// Initialisation d'Express
const app = express();
app.use(express.json());

// Définir l'URL du webhook
const PORT = process.env.PORT || 3000;
const URL = config.APP_URL; // Assure-toi que c’est une URL HTTPS valide (ex: https://monapp.onrender.com)
const webhookPath = `/bot${config.BOT_TOKEN}`;

// Initialisation du bot Telegram en mode webhook
const bot = new TelegramBot(config.BOT_TOKEN, { webHook: true });
bot.setWebHook(`${URL}${webhookPath}`);

// Route pour les requêtes Telegram
app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Route d'accueil (évite "Cannot GET /")
app.get('/', (req, res) => {
  res.send('🤖 Bot Telegram Binance est actif.');
});

// Logs de démarrage
logger.info('🤖 Bot démarré en mode webhook...');
console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);

// Commandes texte
bot.onText(/\/start/, async (msg) => {
  try {
    await deleteLastMessages(bot, msg.chat.id);
    await startCommand.execute(bot, msg.chat.id);
  } catch (err) {
    console.error("Erreur /start :", err.message);
  }
});

bot.onText(/\/help/, async (msg) => {
  try {
    await deleteLastMessages(bot, msg.chat.id);
    await helpCommand.execute(bot, msg.chat.id);
  } catch (err) {
    console.error("Erreur /help :", err.message);
  }
});

bot.onText(/\/rsi/, async (msg) => {
  try {
    await deleteLastMessages(bot, msg.chat.id);
    await rsiCommand.execute(bot, msg.chat.id);
  } catch (err) {
    console.error("Erreur /rsi :", err.message);
  }
});

bot.onText(/\/buySell/, async (msg) => {
  try {
    await deleteLastMessages(bot, msg.chat.id);
    await buySellCommand.execute(bot, msg.chat.id);
  } catch (err) {
    console.error("Erreur /buySell :", err.message);
  }
});

bot.onText(/\/signale/, async (msg) => {
  try {
    await deleteLastMessages(bot, msg.chat.id);
    await signaleCommand.execute(bot, msg.chat.id);
  } catch (err) {
    console.error("Erreur /signale :", err.message);
  }
});

// Callback query (boutons)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    switch (data) {
      case 'rsi':
        await rsiCommand.execute(bot, chatId);
        break;
      case 'buy_sell':
        await buySellCommand.execute(bot, chatId);
        break;
      case 'signal':
        await signaleCommand.execute(bot, chatId);
        break;
      case 'help':
        await helpCommand.execute(bot, chatId);
        break;
      default:
        await bot.sendMessage(chatId, "❓ Commande inconnue.");
    }

    // Supprimer le message contenant les boutons
    await bot.deleteMessage(chatId, query.message.message_id);
  } catch (err) {
    console.error("Erreur callback :", err.message);
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`🚀 Serveur Express lancé sur le port ${PORT}`);
});
