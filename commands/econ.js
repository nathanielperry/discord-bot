const { throwUserError, fetchMessageById } = require('../util/commandHelpers');

module.exports = {
    join: {
        help: `Join the beta economy and start earning virtual income.`,
        description: `
            Type \`!join\` to begin earning virtual income.
            You will earn income once daily if you have been
            active in the server within the last 24 hours.
        `,
        run(message, args) {
            this.db.createUser(message.author.id);
        },
    },
    balance: {
        run(message) {
            this.db.findUser(message.author.id).then(user => {
                if (!user.length) {
                    message.channel.send('Use `!join` to start earning virtual income.');
                } else {
                    const currentUser = user[0];
                    message.channel.send(`<@${currentUser.userid}>'s balance: ${currentUser.economy}`);
                }
            });
        }
    },
    clear: {
        run (message) {
            this.db.clearUsers().then(() => console.log('Cleared all users from database.'))
        }
    }
}