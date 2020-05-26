require('dotenv').config({
    path: `./config/.env.${process.env.NODE_ENV}`
});

const mongoose = require('mongoose');
const Bot = require('./Bot');
const { basicHandler, adminHandler } = require('./config/handlers');

const User = require('./models/User');

mongoose.connect(process.env.MONGODB, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Successfully connected to database.');
});

const bot = new Bot();
bot.addMessageHandler(basicHandler);
bot.addMessageHandler(adminHandler);

bot.login();

setInterval(async () => { //Gain 1 coin an hour.
    const res = await User.updateMany({}, { $inc: { economy: 1 }});
}, 1000 * 60 * 60);