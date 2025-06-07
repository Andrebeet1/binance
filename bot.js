require('dotenv').config();
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

// Création du bot Telegram
const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

logger.info('🤖 Bot démarré...');

// Gestion des commandes
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

// Si besoin, gérer les boutons custom ici
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

  // Supprime le message du bouton après action
  bot.deleteMessage(chatId, query.message.message_id);
});
