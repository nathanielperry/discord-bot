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