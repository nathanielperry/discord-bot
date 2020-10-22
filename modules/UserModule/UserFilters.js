const { setDefaults } = require('../../util/helpers');
const User = require('./User');

module.exports = {
    requireEcon(amt, opt) {
        return async (message, next) => {
            const options = setDefaults(opt, {
                deduct: true,
                loud: true,
            });

            const userId = message.author.id;
            const num = parseInt(amt);
            const user = await User.getUserById(userId);
            const userBalance = user.getBalance();


            if (!Number.isInteger(num)) throw "Invalid ammount provided to requireCoins filter.";
            if (userBalance < num) {
                if (options.loud) {
                    message.channel.send(`Insufficient funds to perform action. You have ${userBalance}, but need ${num}.`);
                }
                return false;
            };
            if (options.deduct) user.giveCoins(-num);
            next();
        }
    }
}