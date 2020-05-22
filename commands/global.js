const { throwCommandError, sendControllerDM } = require('../util/commandHelpers');

const testCallback = function(message, arg) {
    message.channel.send('testCallback triggered successfully' + (arg ? ` with argument: ${arg} ` : '') + '!');
}

const testClose = function() {
    this.close();
}

module.exports = {
    test: {
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

            if (arg === 'dm') {
                sendControllerDM(message.author, {
                    description: 'Test message',
                    commands: [
                        { command: 'test', help: 'Run basic test command.', callback: testCallback },
                        { command: 'close', help: 'Close this controller.', callback: testClose },
                    ],
                    buttons: [
                        { name: 'Button Test', callback: (message) => testCallback(message, 'button') },
                        { emoji: '🚫', name: 'Close Test', callback: testClose },
                    ]
                });
            }
        }
    },
    help: {
        description: `List all commands or read about command usage.`,
        help: `
            Use help by itself to list all available commands.
            Add a command as an argument to learn more about that command.
            e.g. "!help help" to learn more about the help command!
            Something tells me you already figured that one out.
        `,
        hide: true,
        run(message, command) {
            const commands = this.getAvailableCommands(
                message.channel.name, 
                message.member.roles
            );
            if (!command) {
                const lines = [];
                lines.push(`Command List:`)
                Object.keys(commands).forEach((key) => {
                    if(!commands[key].hide) {
                        lines.push(`${key} - ${commands[key].description}`);
                    }
                });
                message.channel.send(lines.join('\n'), {
                    code: true
                });
            } else if (commands[command]) {
                const help = commands[command].help.replace(/^\s+/gm, '');
                message.channel.send(help, {
                    code: true
                });
            } else {
                throwCommandError(`${command} is not a valid command.`);
            }
        }
    },  
}