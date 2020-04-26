const numberEmojis = [
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

const throwCommandError = function(message) {
    throw {
        name: 'commandError',
        message
    }
}

const getCommandAndArgs = function (message) {
    //Return object containing command (name of command) and args (list of arguments)
    const messageArray = message.content.split(' ');
    const command = messageArray[0].substr(1);
    const args = messageArray.slice(1);

    return {
        command,
        args
    }
}

const fetchMessageById = function (guild, messageId) {
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

const createMultiChoiceEmbedFields = function(options) {
    //Give options without an emoji a default emoji
    let nextNumberEmoji = 1;
    options.forEach(option => {
        //TODO: Need error check for more than 9 options using default emojis.
        option.emoji = option.emoji ? option.emoji : numberEmojis[nextNumberEmoji++];
    });

    //Group options into columns of size, colSize
    let optionGroups = [];
    const colSize = 3;
    for (let i = 0; i < options.length; i += colSize) {
        optionGroups.push(options.slice(i, i + colSize));
    }

    //For each column, create an inline field with those options
    //Return array of embed fields
    return optionGroups.map((group, i) => {
        return {
            name: i < 1 ? 'Options' : '--',
            value: group.map(opt => {
                return opt.emoji + ' ' + opt.name;
            }).join('\n\n'),
            inline: true,
        }
    });
}

const reactInSequence = async function(message, emojis) {
    await emojis.reduce(
        (p, emoji) => p.then(() => message.react(emoji)),
        Promise.resolve(null)
    );
    return message;
}

const sendControllerDM = function(user, options) {
    //Send messages via DM and create new controller object
    /* 
    * Options: title (String), description (String), footer (String), commands (Array), buttons (Array),
    * closeTitle (String), closeDescription, (String), closeFooter (String),
    * hideCommandKey (Boolean), hideButtonKey (Boolean)
    * 
    * EXAMPLE OPTIONS OBJECT: {
    *   title: 'Poll Controller',
    *   description: 'Press 🚫 to close the poll and display the results!'
    *   commands: [
    *       { command: 'close', callback: [function] },
    *       { command: 'extend', help: 'Extend the poll length by 10 minutes', 'callback: [function] }
    *   ],
    *   buttons: [
    *       { emoji: '🚫', name:'Close Poll', callback: [function] },
    *       { name: 'Add 10 minutes to poll', callback: [function] }
    *   ],
    *   hideButtonKey: true,
    * }
    */

    //Generate embed fields for message, commands, and buttons options.
    const embedFields = [];
    if (options.commands && !options.hideCommandKey) {
        embedFields.push({
            name: 'Commands',
            value: options.commands.map(cmd => `!${cmd.command}${cmd.help ? ` - ${cmd.help}` : ''}`).join('\n'),
        })
    }
    if (options.buttons && !options.hideButtonKey) {
        embedFields.push(...createMultiChoiceEmbedFields(options.buttons));
    }
    const embed = {
        title: options.title || 'Command Options',
        description: options.description || null,
        footer: options.footer ? { text: options.footer } : null,
        fields: embedFields
    }

    return user.send({ embed }).then(msg => {
        const controller = {
            embed,
            messageCollector: msg.channel.createMessageCollector(m => m.content.startsWith('!')),
            reactionCollector: msg.createReactionCollector((reaction, user) => {
                //Filter collects all reactions in buttons list, ignoring bot
                return options.buttons.map((btn) => btn.emoji).includes(reaction.emoji.name) && user.id !== msg.author.id;
            }),
            close() {
                //Close collectors
                this.messageCollector.stop();
                this.reactionCollector.stop();

                //Update embed to indicate controller has been closed. Use custom options if provided.
                embed.title = options.closedTitle || embed.title + ' - Closed';
                embed.description = options.closedDescription || embed.description;
                embed.footer = { text: options.closedFooter || 'This controller has been closed! No more commands may be used.' };
                embed.fields = [];
                this.update();
            },
            update() {
                msg.edit({ embed: this.embed });
            }
        }

        //On collect, trigger callback if valid command
        controller.messageCollector.on('collect', m => {
            const { command, args } = getCommandAndArgs(m);
            const cmdObject = options.commands.find(o => o.command === command);
            if (cmdObject) {
                //Trigger callback, bound to controller.
                cmdObject.callback.bind(controller)(m, ...args);
            }
        });

        controller.reactionCollector.on('collect', reaction => {
            const cmdObject = options.buttons.find(o => o.emoji === reaction.emoji.name);
            if (cmdObject) {
                //Trigger callback, bound to context object.
                cmdObject.callback.bind(controller)(msg);
            }
        });

        //Add reaction buttons to controller message.
        reactInSequence(msg, options.buttons.map(btn => btn.emoji));

        //Return controller (will come as Promise)
        return controller;
    });
}

module.exports = {
    throwCommandError,
    getCommandAndArgs,
    fetchMessageById,
    reactInSequence,
    createMultiChoiceEmbedFields,
    sendControllerDM,
}