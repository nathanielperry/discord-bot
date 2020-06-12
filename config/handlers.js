const commandHandler = require('../modules/commandHandler');
const diceRoller = require('../modules/diceRoller');
const { restrictToRoles, restrictToChannels, excludeChannels, excludeRoles } = require('../modules/filters');
const Database = require('../util/db');

//Load commands
const poll = require('../commands/poll');
const global = require('../commands/global');
const admin = require('../commands/admin');
const luck = require('../commands/luck');
const econ = require('../commands/econ');

const userDatabase = new Database(process.env.MONGODB);

const basicFilter = (message, next) => {
    if (message.author.bot) return;
    if (message.guild === null) return;
    next();
}


const basicHandler = [
    basicFilter,
    diceRoller(),
    commandHandler({ ...global, ...poll, ...luck, ...econ, }, { db: userDatabase, }),
];

const adminHandler = [,
    basicFilter,
    restrictToRoles('Admins'),
    commandHandler({ ...admin, }),
];

module.exports = {
    basicHandler,
    adminHandler
}