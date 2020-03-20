// Add token from discord bot and rename file to config.js //

const poll = require('./commands/poll');
const global = require('./commands/global');
const admin = require('./commands/admin');
const luck = require('./commands/luck');

export default {
    token: '[DISCORD BOT TOKEN HERE]',
    commandGroups: [
        {
            name: 'global',
            commands: [
                global,
                poll,
                luck
            ],
            context: [/.*/]
        },
        {
            name: 'admin',
            commands: [
                admin
            ],
            context: [/.*/],
            roles: ['Admins'],
        },
    ]
}