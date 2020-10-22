const CommandList = require('../CommandList');

const commands = [
    {
        name: 'post',
        description: 'Post to the group-bulletin channel',
        run(message, ...content) {
            const guild = message.channel.guild;
            const targetChannel = guild.channels.cache.get(this.options.channelId);
            if (targetChannel) {
                //If channel exists, send content.
                targetChannel.send(`--- <@${message.author.id}> posted the following bulletin:\n` + content.join(' '));
                message.delete();
            } else {
                //If not, give error response.
                throw Error(`${this.options.channelId} is not an existing text channel for ${guild.name}.`);
            }
        }
    },
];

module.exports = class PostCommand extends CommandList {
    constructor(options) {
        super(commands, options);
    }
}