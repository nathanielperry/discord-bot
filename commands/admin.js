const { fetchMessageById } = require('../commandHelpers');

module.exports = {
    repeat: {
        description: `Repeats message to given channel name.`,
        help: `
            Speak as the bot in any channel!
            Use format: !repeat [channel-name] [message]
            e.g. "!repeat general Howdy y'all! It's me, the bot!"
        `,
        hide: true,
        run(message, arg, ...content) {
            const guild = message.channel.guild;
            const targetChannel = guild.channels.find(channel => {
                //Find matching text only channel.
                return channel.name.includes(arg) && channel.type === 'text';
            });
            if (targetChannel) {
                //If channel exists, send content.
                targetChannel.send(content.join(' '));
            } else {
                //If not, give error response.
                message.channel.send(`${arg} is not an existing text channel.`)
            }
        }
    },
    react: {
        description: `Reacts to a given message id with a given emoji.`,
        help: `
            React to any message by inputting the message id, and the desired emoji.
            e.g. "!react [message-id] [non-custom-emoji]"
            Must have develop mode enabled in Discord settings to copy Message IDs.
        `,
        hide: true,
        run(message, messageId, emoji) {
            fetchMessageById(message.guild, messageId).then(fetchedMessage => {
                if (!fetchedMessage) {
                    //If no message found, send error response.
                    message.channel.send('Unable to find message by that ID.');
                } else {
                    fetchedMessage.react(emoji).catch(err => {
                        message.channel.send('Not a valid emoji.');
                    });
                }
            });
        }
    }
}