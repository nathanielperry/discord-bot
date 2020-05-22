require('dotenv').config({
    path: `./config/.env.${process.env.NODE_ENV}`
});

const Bot = require('./Bot');
const { basicHandler, adminHandler } = require('./config/handlers');

const bot = new Bot();
bot.addMessageHandler(basicHandler);
bot.addMessageHandler(adminHandler);

bot.login();