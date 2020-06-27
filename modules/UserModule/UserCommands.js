const CommandList = require('../CommandList');
const { throwUserError, getIdFromMention } = require('../../util/commandHelpers');
const User = require('./User');

const commands = [
    {
        name: 'join',
        async run(message) {
            const userId = message.author.id;
            const newUser = await User.createUser(userId);
            if (newUser) {
                message.channel.send(`<@${userId}> added to database.`);
            } else {
                message.channel.send(`<@${userId}> already exists in database.`);
            }
        }
    },
    {
        name: 'give',
        async run(message, mention, amt) {
            const userId = getIdFromMention(mention);
            const num = parseInt(amt);
            const user = await User.getUserById(userId);
            if (!user) throwUserError('Invalid user provided.', message);
            if (!Number.isInteger(num)) throwUserError('Invalid amount provided.', message);
            
            await user.giveCoins(num);
            message.channel.send(`Gave ${num} coins to ${mention} successfully.`);

            return user;
        }
    },
    {
        name: 'balance',
        async run(message, mention) {
            const userId = mention ? getIdFromMention(mention) : message.author.id;
            let user = await User.getUserById(userId);
            if (!user) throwUserError('Invalid user provided.', message);
            message.channel.send(`<@${userId}> has a balance of ${user.getBalance()} coins.`);
        }
    },
    {
        name: 'clear',
        async run(message) {
            const results = await User.deleteMany({});
        }
    }
];  

module.exports = class UserCommands extends CommandList {
    constructor(options) {
        super(commands, options);
    }
}