const defaultEmojis = [
    "\u0030\u20E3", //0
    "\u0031\u20E3", //1
    "\u0032\u20E3", //2
    "\u0033\u20E3", //3
    "\u0034\u20E3", //4
    "\u0035\u20E3", //5
    "\u0036\u20E3", //6
    "\u0037\u20E3", //7
    "\u0038\u20E3", //8
    "\u0039\u20E3", //9
];

exports.getCommandAndArgs = function (message) {
    //Return object containing command (name of command) and args (list of arguments)
    const messageArray = message.content.split(' ');
    const command = messageArray[0].substr(1);
    const args = messageArray.slice(1);

    return {
        command,
        args
    }
}

exports.fetchMessageById = function (guild, messageId) {
    const messages = guild.channels.map(channel => {
        //Only search in text channels
        if (channel.type !== 'text') {
            return null;
        }
        //Return promise array, containing all attempts
        return channel.fetchMessage(messageId).then(msg => {
            return msg;
        }).catch(err => {
            return null;
        });
    });

    return Promise.all(messages).then(messages => {
        //Get fetched message from all fetch attempts
        return messages.find(msg => msg);
    });
}

exports.createMultiChoiceMessageEmbed = function (title, footer, options) {
    //OPTIONS EXAMPLE:
    //sendReactOptionsMessage(channel, 'Question goes here', [
        //  { emoji: '👍', name: 'Yes' },
        //  { emoji: '👎', name: 'No' },
        //  { emoji: '🤷', name: 'Shrug' },
    //]);

    //TODO: Need error check to ensure same emoji is not used more than once.

    //Give options without an emoji a default emoji
    let nextNumberEmoji = 1;
    options.forEach(option => {
        //TODO: Need error check for more than 9 options using default emojis.
        option.emoji = option.emoji ? option.emoji : defaultEmojis[nextNumberEmoji++];
    });

    //Group options into columns of size, colSize
    let optionGroups = [];
    const colSize = 3;
    for (let i = 0; i < options.length; i += colSize) {
        optionGroups.push(options.slice(i, i + colSize));
    }
    
    //Build message embed detailing options
    return {
        title,
        //For each column, create an inline field with those options
        fields: optionGroups.map((group, i) => {
            return {
                name: i < 1 ? 'Options' : '--',
                value: group.map(opt => {
                    return opt.emoji + ' ' + opt.name;
                }).join('\n\n'),
                inline: true,
            }
        }),
        footer: { 
            text: footer,
        }
    }
}