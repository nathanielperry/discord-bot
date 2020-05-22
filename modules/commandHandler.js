const { getCommandAndArgs } = require('../util/commandHelpers');

const commandHandler = function (commands, prefix = process.env.PREFIX) {
    if (!prefix) throw Error('Missing command prefix. Please specify prefix as second argument to commandHandler, or in .env file.');

    return (message, next) => {
        //Search for matching command and run it, passing any arguments
        if (!message.content.startsWith(prefix)) return false;
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