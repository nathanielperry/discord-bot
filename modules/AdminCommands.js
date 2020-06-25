const CommandList = require('../modules/CommandList');
const { throwUserError, fetchMessageById } = require('../util/commandHelpers');

const commands = [
    {
        name: 'repeat',
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
                throwUserError(`${arg} is not an existing text channel.`)
            }
        }
    },
    {
        name: 'react',
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
                    throwUserError('Unable to find message by that ID.');
                } else {
                    fetchedMessage.react(emoji).catch(err => {
                        throwUserError('Not a valid emoji.');
                    });
                }
            });
        }
    }
]

class AdminCommands extends CommandList {
    constructor(options) {
        super(commands, options);
    }
}

module.exports = AdminCommands;