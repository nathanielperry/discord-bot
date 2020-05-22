// const diceRoller = require('../modules/diceRoller');
const commandHandler = require('../modules/commandHandler');
const { restrictToRoles, restrictToChannels, excludeChannels, excludeRoles } = require('../modules/filters');

//Load commands
const poll = require('../commands/poll');
const global = require('../commands/global');
const admin = require('../commands/admin');
const luck = require('../commands/luck');

// const filter = {
//     startsWith: '!',
//     bot: false,
//     dm: false,
// };

const basicFilter = (message, next) => {
    if (message.author.bot) return;
    if (message.guild === null) return;
    next();
}

const basicHandler = [
    basicFilter,
    commandHandler({
        ...global,
        ...poll,
        ...luck,
    }),
];

const adminHandler = [,
    basicFilter,
    restrictToRoles('Admins'),
    commandHandler({
        ...admin,
    }),
];

module.exports = {
    basicHandler,
    adminHandler
}