const CommandList = require('../CommandList');
const { throwUserError, getIdFromMention } = require('../../util/commandHelpers');
const User = require('./User');

const createUser = async function(message, userId) {
    const newUser = await User.createUser(userId);
}

const commands = [
    {
        name: 'give',
        async run(message, mention, amt) {
            const userId = getIdFromMention(mention);
            const num = parseInt(amt);
            const reciever = await User.getUserById(userId);
            const giver = await User.getUserById(message.author.id);
            if (!reciever) throwUserError('Invalid user provided.', message);
            if (!Number.isInteger(num)) throwUserError('Invalid amount provided.', message);
            if (giver.getBalance() < num) throwUserError('Insufficient funds for coin transfer.', message);

            await reciever.giveCoins(num);
            await giver.giveCoins(-num);
            message.channel.send(`Gave ${num} coin${num > 1 ? 's' : ''} to ${mention}.`);

            return true;
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
        name: 'activity',
        async run(message, mention) {
            const userId = mention ? getIdFromMention(mention) : message.author.id;
            let user = await User.getUserById(userId);
            if (!user) throwUserError('Invalid user provided.', message);
            message.channel.send(`<@${userId}> has an activity score of ${user.activity}, and a daily active streak of ${user.dailyStreak}.`);
        }
    },
    {
        name: 'add-coins',
        admin: true,
        async run(message, mention, amt) {
            const userId = getIdFromMention(mention);
            const num = parseInt(amt);
            const user = await User.getUserById(userId);
            if (!user) throwUserError('Invalid user provided.', message);
            if (!Number.isInteger(num)) throwUserError('Invalid amount provided.', message);
            
            await user.giveCoins(num);
            message.channel.send(`Gave ${num} coin${num > 1 ? 's' : ''} to ${mention}.`);

            return user;
        }
    },
    {
        name: 'joinall',
        admin: true,
        async run(message) {
            const members = message.guild.members.filter(member => {
                return member.roles.find(role => role.name === process.env.ECONOMY_ROLE_NAME);
            })
            members.forEach(async member => {
                createUser(message, member.id);
            });
        }
    },
    {
        name: 'clear',
        admin: true,
        async run(message) {
            //TODO: Add confirmation prompt
            const results = await User.deleteMany({});
        }
    }
];  

module.exports = class UserCommands extends CommandList {
    constructor(options) {
        super(commands, options);
        this.User = User;
    }
}