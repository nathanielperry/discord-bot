// Add token from discord bot and rename file to config.js //

const basic = require('./commands/basic');
const poll = require('./commands/poll');
const global = require('./commands/global');
const luck = require('./commands/luck');

export default {
    token: '[DISCORD BOT TOKEN HERE]',
    commandGroups: [
        {
            name: 'basic',
            commands: [
                basic,
                poll,
                luck
            ],
            context: [/.*/]
        },
        {
            name: 'global',
            commands: [
                global
            ],
            context: [/.*/]
        }
    ]
}