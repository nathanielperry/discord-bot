const UserCommands = require('./UserCommands');
const User = require('./User');

module.exports = class UserModule {
    constructor(bot) {
        this.UserCommands = new UserCommands();
        this.User = User;
        this.bot = bot;
    }
    
    //TODO: create addModule function to bot instance
    //* modules will have automatic access to bot instance
    //* can check for module dependency
    async increaseActivity() {
        //Add any new users to database
        this.bot.client.guilds.cache.forEach(guild => {
            const members = guild.members.cache.filter(member => {
                return member.roles.cache.find(role => role.name === process.env.ECONOMY_ROLE_NAME);
            })
            members.forEach(async member => {
                this.User.createUser(member.id);
            });
        })

        //Every hour, increase activity by 1 for each
        //user that sent a message in the last hour.
        const users = await this.User.getUsers();
        users.forEach(async user => {
            const guildUser = await this.bot.client.users.fetch(user._id);
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
    }

    async dailyIncome() {
        const users = await this.User.getUsers();
        users.forEach(async user => {
            const guildUser = await bot.client.users.fetch(user._id);
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
            //Reset activity level
            await user.setActivity(0);
        });
    }

    init() {
        //Cron Jobs

        //guildUser = discord API user object.
        //user = mongoose User instance.
        this.increaseActivity();

        //Hourly
        this.bot.addScheduledTask('Activity Scoring', '00 00 * * * *', this.increaseActivity);
        //Daily
        this.bot.addScheduledTask('Daily Income', '00 00 00 * * *', this.dailyIncome);
    }

    getHandler() {
        return this.UserCommands.getHandler();
    }
}