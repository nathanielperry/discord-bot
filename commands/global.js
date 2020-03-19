module.exports = {
    help: {
        description: `List commands or read about command usage.`,
        help: `
            Nobody can help you.
        `,
        hide: true,
        run(message, command) {
            const commands = this.getAvailableCommands(message.channel.name);
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