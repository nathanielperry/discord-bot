const { getCommandAndArgs } = require('./commandHelpers');
const { commandGroups } = require('./config');

const commandController = function () {
    return {
        commandGroups,
        getAvailableCommands(currentContext, userRoles) {
            let available = {};

            this.commandGroups.forEach(group => {
                const groupMatchesContext = group.context.find((groupContext) => {
                    if (groupContext instanceof RegExp) {
                        //Regular Expression Check
                        return groupContext.test(currentContext);
                    } else {
                        //If not RegExp, exact value comparison
                        return currentContext === groupContext;
                    }
                });

                const groupMatchesUserRole = group.roles ? userRoles.some(role => group.roles.includes(role.name)) : true;

                if (groupMatchesContext && groupMatchesUserRole) {
                    available = Object.assign(available, ...group.commands);
                }
            });

            return available;
        },
        processCommand(message) {
            //Search for matching command and run it, passing any arguments
            const { command, args } = getCommandAndArgs(message);
            const context = message.channel.name;
            const userRoles = message.member.roles;

            //Get object containing all commands for given channel (context).
            const availableCommands = this.getAvailableCommands(context, userRoles);

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