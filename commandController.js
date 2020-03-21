const { getCommandAndArgs } = require('./commandHelpers');
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
                //If command exists:
                try {
                    //Try to run command
                    //Bind the command to the commandController so it can access
                    //any command controller functions
                    availableCommands[command].run.bind(this)(message, ...args);
                } 
                catch(error) {
                    //If command produces error, log it and send generic error to channel.
                    console.log(error);
                    message.channel.send(`Something broke when you used the !${command} command.`);
                }
            } else {
                //If command does not exist (in availableCommands) send not valid error
                message.channel.send(`${command} is not a valid command.`);
            }
        }
    } 
}

module.exports = commandController;