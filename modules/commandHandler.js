const { getCommandAndArgs } = require('../util/commandHelpers');

const commandHandler = function (commands, prefix = process.env.PREFIX) {
    return (message, next) => {
        //Search for matching command and run it, passing any arguments
        if (!message.content.startsWith(prefix)) return next();
        const { command, args } = getCommandAndArgs(message, prefix);

        if (commands[command]) {
            //If command exists, try to run command
            commands[command].run(message, ...args);
            return true;
        }

        next();
    } 
}

module.exports = commandHandler;