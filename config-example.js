// Add token from discord bot and rename file to config.js //

import basic from './commands/basic';
import poll from './commands/poll';
import global from './commands/global';

export default {
    token: '[DISCORD BOT TOKEN HERE]',
    commandGroups: [
        {
            name: 'basic',
            commands: [
                basic,
                poll
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