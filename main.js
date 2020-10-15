const fs = require('fs');
require('dotenv').config({
    path: `./config/.env.${process.env.NODE_ENV}`
});

const { fetchMemberById } = require('./util/commandHelpers');

const Bot = require('./Bot');
const bot = new Bot();

//Handlers & Commands
const diceRoller = require('./modules/diceRoller');
const { 
    onReject,
    ejectOnFail,
    ignoreBots,
    ignoreDMs,
    restrictToRoles, 
    restrictToChannels, 
    excludeChannels, 
    excludeRoles,
    filterContent,
} = require('./modules/filters');

const GlobalCommands = require('./modules/GlobalCommands');
const AdminCommands = require('./modules/AdminCommands');
const UserModule = require('./modules/UserModule/UserModule');

const userModule = new UserModule();

const globalCommandHandler = new GlobalCommands().getHandler();
const adminCommandHandler = new AdminCommands().getHandler();
const userCommandHandler = userModule.getCommandHandler();

userModule.init(bot);

//Global language filter
let badWordsString = fs.readFileSync('config/bad-words.txt', 'utf8');
let badWordsArray = badWordsString.split('\n');
bot.addMessageHandler([
    ejectOnFail([
        filterContent(badWordsArray),
    ]),
], (message) => { //Eject handler
    message.delete();
});

//Basic commands
bot.addMessageHandler([
    ignoreBots,
    ignoreDMs,
    diceRoller(),
    globalCommandHandler,
    userCommandHandler,
]);

//Admin commands
bot.addMessageHandler([
    ignoreBots,
    ignoreDMs,
    restrictToRoles('Admins'),
    adminCommandHandler,
]);

bot.login();