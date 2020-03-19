const { getCommandAndArgs } = require('./commandHelpers');
const { commandGroups } = require('./config');

const commandController = function () {
    return {
        commandGroups,
        getAvailableCommands(currentContext) {
            //Returns new object containing all available commands for a given context (Channel)
            return this.commandGroups.reduce((available, group) => {
                if(group.context.find((groupContext) => {
                    if (groupContext instanceof RegExp) {
                        //Regular Expression Check
                        return groupContext.test(currentContext);
                    } else {
                        //If not RegExp, exact value comparison
                        return currentContext === groupContext;
                    }
                })) {
                    //If currentContext matches any groupContext, add commands to available list
                    return Object.assign(available, ...group.commands);
                } else {
                    return available;
                }
            }, {});
        },
        processCommand(message) {
            //Search for matching command and run it, passing any arguments
            const { command, args } = getCommandAndArgs(message);
            const context = message.channel.name;

            //Get object containing all commands for given channel (context).
            const availableCommands = this.getAvailableCommands(context);

            if (availableCommands[command]) {
                try {
                    availableCommands[command].run.bind(this)(message, ...args);
                } 
                catch(error) {
                    console.log(error);
                    message.channel.send(`Something broke when you used the !${command} command.`);
                }
            } else {
                message.channel.send(`${command} is not a valid command.`);
            }
        }
    } 
}

module.exports = commandController;