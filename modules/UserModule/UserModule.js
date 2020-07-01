const UserCommands = require('./UserCommands');
const User = require('./User');

const filters = {
    requireCoins(amt, deduct = true) {
        return async (message, next) => {
            const userId = message.author.id;
            const num = parseInt(amt);
            const user = await User.getUserById(userId);

            if (!Number.isInteger(num)) throw "Invalid ammount provided to requireCoins filter.";
            if (user.getBalance() < num) return false;
            if (deduct) user.giveCoins(-num);
            
            next();
        }
    }
}

module.exports = class UserModule {
    constructor() {
        this.UserCommands = new UserCommands();
        this.User = User;
    }
    
    //TODO: create addModule function to bot instance
    //* modules will have automatic access to bot instance
    //* can check for module dependency
    init(bot) {
        //Cron Jobs

        //guildUser = discord API user object.
        //user = mongoose User instance.

        //Hourly
        bot.addScheduledTask('Activity Scoring', '00 00 * * * *', async () => {
            //Every hour, increase activity by 1 for each
            //user that sent a message in the last hour. 
            const users = await this.User.getUsers();
            users.forEach(async user => {
                const guildUser = await bot.client.fetchUser(user._id);
                if (guildUser.lastMessage) {
                    const timeSinceLastMessage = Date.now() - guildUser.lastMessage.createdTimestamp;
                    if (timeSinceLastMessage < 1000 * 60 * 60) {
                        //If streak is less than 1, set to 1.
                        if (user.dailyStreak < 1) {
                            await user.setDailyStreak(1);
                        }
                        await user.giveActivity(1);
                    }
                }
            });
        });

        //Daily
        bot.addScheduledTask('Daily Income', '00 00 00 * * *', async () => {
            const users = await this.User.getUsers();
            users.forEach(async user => {
                const guildUser = await bot.client.fetchUser(user._id);
                const timeSinceLastMessage = guildUser.lastMessage ? Date.now() - guildUser.lastMessage.createdTimestamp : null;

                if (!timeSinceLastMessage && timeSinceLastMessage > 1000 * 60 * 60 * 24) {
                    //If no activity in last 24 hours:
                    //Set daily streak to 0 or subtract 1 if already 0;
                    const penalty = user.dailyStreak > 0 ? user.dailyStreak : 1;
                    await user.giveDailyStreak(-penalty);
                } else {
                    //Increase daily streak by 1
                    await user.giveDailyStreak(1);
                }

                //Provide income at 10 * activity level * (dailyStreak/5).
                await user.giveCoins(user.getDailyStreakMultiplier() * user.activity * 10);
            });
        });
    }

    getCommandHandler() {
        return this.UserCommands.getHandler();
    }
}