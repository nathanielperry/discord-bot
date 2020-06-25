const CommandList = require('../CommandList');
const Users = require('./User');

const commands = [
    {
        name: 'join',
        run(message) {
            const userId = message.author.id;
            Users.findUser(userId)
            .then(user => {
                if (!user.length) {
                    Users.createUser(userId);
                    message.channel.send(`<@${userId}> added to database.`);
                } else {
                    message.channel.send(`<@${userId}> already exists in database.`);
                }
            });
        }
    },
    {
        name: 'clear',
        run(message) {
            Users.clearUsers();
        }
    }
];  

module.exports = class UserCommands extends CommandList {
    constructor(options) {
        super(commands, options);
    }
}