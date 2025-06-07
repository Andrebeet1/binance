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

// Initialisation Express
const app = express();
app.use(express.json());

// Configuration du bot en mode webhook
const bot = new TelegramBot(config.BOT_TOKEN, { webHook: true });

// Définir l’URL du webhook
const PORT = process.env.PORT || 3000;
const URL = config.APP_URL; // Assure-toi que c'est bien une URL HTTPS valide
const webhookPath = `/bot${config.BOT_TOKEN}`;

bot.setWebHook(`${URL}${webhookPath}`);

// Route de réception des updates Telegram
app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Logs de démarrage
logger.info('🤖 Bot démarré en mode webhook...');
console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);

// Gestion des commandes
bot.onText(/\/start/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  await startCommand.execute(bot, msg.chat.id);
});

bot.onText(/\/help/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  await helpCommand.execute(bot, msg.chat.id);
});

bot.onText(/\/rsi/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  await rsiCommand.execute(bot, msg.chat.id);
});

bot.onText(/\/buySell/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  await buySellCommand.execute(bot, msg.chat.id);
});

bot.onText(/\/signale/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  await signaleCommand.execute(bot, msg.chat.id);
});

// Gestion des boutons (callback_query)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

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
  try {
    await bot.deleteMessage(chatId, query.message.message_id);
  } catch (err) {
    console.error("Erreur de suppression :", err.message);
  }
});

// Démarrage du serveur Express
app.listen(PORT, () => {
  logger.info(`🚀 Serveur Express lancé sur le port ${PORT}`);
});
