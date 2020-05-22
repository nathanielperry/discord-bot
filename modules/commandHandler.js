const { getCommandAndArgs } = require('../util/commandHelpers');

const commandHandler = function (commands, prefix = process.env.PREFIX) {
    return (message, next) => {
        //Add commands ref to this for access within command.run();
        this.commands = commands;

        //Pass message onto next middleware if missing or incorrect command prefix
        if (!message.content.startsWith(prefix)) return next();

        //Search for matching command and run it, passing any arguments
        let { command, args } = getCommandAndArgs(message, prefix);
        command = command.toLowerCase();

        if (commands[command]) {
            //If command exists, try to run command
            //bind to this to have access to full command list
            commands[command].run.bind(this)(message, ...args);
            return true;
        }

        next();
    } 
}

module.exports = commandHandler;