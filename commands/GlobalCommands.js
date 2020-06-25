const CommandList = require('../modules/CommandList');
const { throwUserError, sendControllerDM } = require('../util/commandHelpers');
const luck = require('./luck');

const commands = [
    {
        name: 'test',
        description: `Just a test command! Nothing to see here!`,
        help: `
            Just a test command! Nothing to see here!
        `,
        hide: true,
        run(message, arg) {
            message.channel.send('You ran the test command! Good job!');
            if (arg === 'error') {
                throw "Generated a fake error!";
            }

            if (arg === 'user-error') {
                throwUserError("Generated a fake user error!");
            }

            if (arg === 'method') {
                this.testMethod(message);
            }

            if (arg === 'dm') {
                sendControllerDM(message.author, {
                    description: 'Test message',
                    commands: [
                        { command: 'test', help: 'Run basic test command.', callback: this.testCallback },
                        { command: 'close', help: 'Close this controller.', callback: this.testClose },
                    ],
                    buttons: [
                        { name: 'Button Test', callback: (message) => this.testCallback(message, 'button') },
                        { emoji: '🚫', name: 'Close Test', callback: this.testClose },
                    ]
                });
            }
        }
    },
    ...luck //Flip & Call
]

class GlobalCommands extends CommandList {
    constructor(options) {
        super(commands, options);
    }
    
    testCallback(message, arg) {
        message.channel.send('testCallback triggered successfully' + (arg ? ` with argument: ${arg} ` : '') + '!');
    }
    
    testClose() {
        this.close();
    }

    testMethod(message) {
        message.channel.send('Ran testMethod successfully');
    }
}

module.exports = GlobalCommands;