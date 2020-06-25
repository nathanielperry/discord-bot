// const diceRoller = require('../modules/diceRoller');
const diceRoller = require('../modules/diceRoller');
const { 
    ignoreBots,
    ignoreDMs,
    restrictToRoles, 
    restrictToChannels, 
    excludeChannels, 
    excludeRoles 
} = require('../modules/filters');

//Load commands
const GlobalCommands = require('../modules/GlobalCommands');
const AdminCommands = require('../modules/AdminCommands');
const UserCommands = require('../modules/UserModule/UserCommands');

const globalCommandHandler = new GlobalCommands().getHandler();
const adminCommandHandler = new AdminCommands().getHandler();
const userCommandHandler = new UserCommands().getHandler();

const basicHandler = [
    ignoreBots,
    ignoreDMs,
    diceRoller(),
    globalCommandHandler,
    userCommandHandler,
];

const adminHandler = [
    ignoreBots,
    ignoreDMs,
    restrictToRoles('Admins'),
    adminCommandHandler,
]

module.exports = {
    basicHandler,
    adminHandler
}