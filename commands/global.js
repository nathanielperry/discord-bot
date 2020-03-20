module.exports = {
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
                message.channel.send(`${command} is not a valid command.`);
            }
        }
    }
}