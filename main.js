const fs = require('fs');
const events = require('./util/event');
require('dotenv').config({
    path: `./config/.env.${process.env.NODE_ENV}`
});

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
const PostCommand = require('./modules/commands/post');
const { requireEcon } = require('./modules/UserModule/UserFilters');

const userModule = new UserModule(bot);
//TODO: Separate event for bot-connect AND db-ready
events.on('bot-connected', () => userModule.init());

const postCommand = new PostCommand({ channelId: process.env.BULLETIN_CHANNEL_ID });
const globalCommandHandler = new GlobalCommands().getHandler();
const adminCommandHandler = new AdminCommands().getHandler();
const userCommandHandler = userModule.getHandler();
const postCommandHandler = postCommand.getHandler();


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

//Bot and DM filter
bot.addMessageHandler([
    ejectOnFail([
        ignoreBots,
        ignoreDMs,
    ]),
]);

//Basic commands
bot.addMessageHandler([
    diceRoller(),
    globalCommandHandler,
    userCommandHandler,
]);

//Post command
//TODO: Create easier syntax for including paid commands
bot.addMessageHandler([
    postCommand.isValidCommand(),
    ejectOnFail(requireEcon(500)),
    postCommandHandler
]);

//Admin commands
bot.addMessageHandler([
    restrictToRoles('Admins'),
    adminCommandHandler,
]);


bot.login();