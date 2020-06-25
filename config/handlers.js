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
const GlobalCommands = require('../commands/GlobalCommands');
const AdminCommands = require('../commands/AdminCommands');

const globalCommandHandler = new GlobalCommands().getHandler();
const AdminCommandHandler = new AdminCommands().getHandler();

const basicHandler = [
    ignoreBots,
    ignoreDMs,
    diceRoller(),
    globalCommandHandler,
];

const adminHandler = [
    ignoreBots,
    ignoreDMs,
    restrictToRoles('Admins'),
    AdminCommandHandler,
];

module.exports = {
    basicHandler,
    adminHandler
}