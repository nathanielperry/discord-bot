const { getCommandAndArgs, throwCommandError } = require('./commandHelpers');
const { commandGroups } = require('./config/command-mapping');

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
            //Do not process if command came via DM
            if (message.guild === null) {
                return false;
            }

            //Search for matching command and run it, passing any arguments
            const { command, args } = getCommandAndArgs(message);
            //Get context (channel command is sent from)
            //and get roles of person sending command
            //to determine which commands are available to them
            const context = message.channel.name;
            const userRoles = message.member.roles;

            //Get object containing all commands for given channel (context) and user roles.
            const availableCommands = this.getAvailableCommands(context, userRoles);

            if (availableCommands[command]) {
                //If command exists, try to run command
                //Bind the command to the commandController so it can access
                //any command controller functions
                availableCommands[command].run.bind(this)(message, ...args);
            } else {
                //If command does not exist (in availableCommands) throw not valid error
                throwCommandError(`${command} is not a valid command.`);
            }
        }
    } 
}

module.exports = commandController;