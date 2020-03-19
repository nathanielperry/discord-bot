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
                return channel.name === arg && channel.type === 'text';
            });
            if (targetChannel) { //TODO: Check if target channel is a text channel also.
                targetChannel.send(content.join(' '));
            } else {
                message.channel.send(`${arg} is not an existing text channel.`)
            }
        }
    }
}