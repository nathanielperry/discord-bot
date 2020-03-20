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