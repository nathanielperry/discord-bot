const poll = require('../commands/poll');
const global = require('../commands/global');
const admin = require('../commands/admin');
const luck = require('../commands/luck');

module.exports = {
    commandGroups: [
        {
            name: 'Global Commands',
            commands: [
                global,
                poll,
                luck
            ],
            context: [/.*/]
        },
        {
            name: 'Adming Only',
            commands: [
                admin
            ],
            context: [/.*/],
            roles: ['Admins'],
        },
    ]
}