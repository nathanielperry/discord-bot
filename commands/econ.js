const { throwUserError, fetchMessageById } = require('../util/commandHelpers');
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = {
    join: {
        help: `Join the beta economy and start earning virtual income.`,
        description: `
            Type \`!join\` to begin earning virtual income.
            You will earn income once daily if you have been
            active in the server within the last 24 hours.
        `,
        run(message, args) {
            User.find({ userid: message.author.id }, (err, user) => {
                if (err) throw err;
                if (!user.length) {
                    message.channel.send('Creating new user...');
                    User.create({ userid: message.author.id });
                } else {
                    message.channel.send('User already joined.');
                }
            });
        },
    },
    balance: {
        run(message) {
            User.find({ userid: message.author.id }, (err, user) => {
                if (err) throw err;
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
            User.remove({}, err => err ? console.log(err) : message.channel.send('Users cleared.'));
        }
    }
}