require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');

// Import des commandes
const startCommand = require('./commands/start');
const helpCommand = require('./commands/help');
const rsiCommand = require('./commands/rsi');
const buySellCommand = require('./commands/buySell');
const signaleCommand = require('./commands/signale');

const { deleteLastMessages } = require('./utils/telegramHelpers');
const logger = require('./utils/logger');

// Setup Express pour webhook
const app = express();
app.use(express.json());

const bot = new TelegramBot(config.BOT_TOKEN, { webHook: true });

// Définir l'URL du webhook
const URL = config.APP_URL;
const PORT = process.env.PORT || 3000;
const webhookPath = `/bot${config.BOT_TOKEN}`;

bot.setWebHook(`${URL}${webhookPath}`);

// Route pour recevoir les mises à jour Telegram
app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

logger.info('🤖 Bot démarré en mode webhook...');

// Commandes
bot.onText(/\/start/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  startCommand.execute(bot, msg.chat.id);
});

bot.onText(/\/help/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  helpCommand.execute(bot, msg.chat.id);
});

bot.onText(/\/rsi/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  rsiCommand.execute(bot, msg.chat.id);
});

bot.onText(/\/buySell/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  buySellCommand.execute(bot, msg.chat.id);
});

bot.onText(/\/signale/, async (msg) => {
  await deleteLastMessages(bot, msg.chat.id);
  signaleCommand.execute(bot, msg.chat.id);
});

// Callback boutons
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  switch (data) {
    case 'rsi':
      rsiCommand.execute(bot, chatId);
      break;
    case 'buy_sell':
      buySellCommand.execute(bot, chatId);
      break;
    case 'signal':
      signaleCommand.execute(bot, chatId);
      break;
    case 'help':
      helpCommand.execute(bot, chatId);
      break;
    default:
      bot.sendMessage(chatId, "❓ Commande inconnue.");
  }

  bot.deleteMessage(chatId, query.message.message_id);
});

// Démarrer Express
app.listen(PORT, () => {
  console.log(`🚀 Serveur Express lancé sur le port ${PORT}`);
});
