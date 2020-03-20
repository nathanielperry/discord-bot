module.exports = {
    repeat: {
        description: `Repeats message to given channel name.`,
        help: `
            Speak as the bot in any channel!
            Use formate: !repeat [channel-name] [message]
            e.g. "!repeat general How y'all! It's me, the bot!"
        `,
        hide: true,
        run(message, arg, ...content) {
            const guild = message.channel.guild;
            const targetChannel = guild.channels.find(channel => {
                //Find matching text only channel.
                return channel.name === arg && channel.type === 'text';
            });
            if (targetChannel) {
                //If channel exists, send content.
                targetChannel.send(content.join(' '));
            } else {
                //If not, give error response.
                message.channel.send(`${arg} is not an existing text channel.`)
            }
        }
    }
}