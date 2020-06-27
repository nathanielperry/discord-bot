const { setDefaults } = require('../util/helpers');
const { getCommandAndArgs } = require('../util/commandHelpers');

module.exports = class CommandList {
    constructor(commands, options) {
        this.commands = commands;
        options = setDefaults(options, {
            prefix: process.env.PREFIX,
        });

        this.prefix = options.prefix;
    }

    _findCommand(str) {
        return this.commands.find(cmd => {
            return cmd.name === str;
        });
    }

    _getCommandFunction(name) {
        const command = this._findCommand(name);
        if (command) {
            return command.run.bind(this);
        }
        return null;
    }

    getHelpStrings() {
        //Returns list of objects containing command help and description strings.
        return this.commands.reduce((helpList, cmd) => {
            //If command not hidden, add help text to list
            if (!cmd.hide) {
                helpList = helpList.concat([
                    { 
                        help: cmd.help, 
                        description: cmd.description,
                    }
                ]);
            }
        }, []);
    }


    getHandler() {
        return (message, next) => {    
            //Pass message onto next middleware if missing or incorrect command prefix
            if (!message.content.startsWith(this.prefix)) return next();
    
            //Search for matching command and run it, passing any arguments
            let { command, args } = getCommandAndArgs(message, this.prefix);
    
            const run = this._getCommandFunction(command.toLowerCase());
            if (run) { 
                run(message, ...args);
            }

            next();
        }
    }
}