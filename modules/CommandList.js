const { setDefaults } = require('../util/helpers');
const { getCommandAndArgs } = require('../util/commandHelpers');

module.exports = class CommandList {
    constructor(commands, options) {
        this.commands = commands;
        this.options = setDefaults(options, {
            prefix: process.env.PREFIX,
            adminRole: process.env.ADMINROLE || 'Admins',
        });

        this.prefix = this.options.prefix;
        this.adminRole = this.options.adminRole;
    }

    _findCommand(str) {
        return this.commands.find(cmd => {
            return cmd.name === str;
        });
    }

    _getCommandObject(name) {
        const command = this._findCommand(name);
        if (command) {
            return command;
        }
        return null;
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
    
            const cmd = this._getCommandObject(command.toLowerCase());
            const isAdmin = message.member.roles.cache.some(role => role.name === this.adminRole);

            if (cmd) {
                //Do not run admin commands if not admin.
                if (cmd.admin && !isAdmin) {
                    return next();
                }

                if (cmd.run) cmd.run.bind(this)(message, ...args);
            }
            next();
        }
    }

    isValidCommand() {
        return (message, next) => {
            //Invalid prefix
            if (!message.content.startsWith(this.prefix)) return false;

            let { command, args } = getCommandAndArgs(message, this.prefix);    
            const cmd = this._getCommandObject(command.toLowerCase());
            const isAdmin = message.member.roles.cache.some(role => role.name === this.adminRole);

            //Invalid command name
            if (!cmd) return false;
            //Invalid permissions
            if(cmd.admin && !isAdmin) return false;

            return next();
        }
    }
}