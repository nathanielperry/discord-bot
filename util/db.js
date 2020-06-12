const mongoose = require('mongoose');
const User = require('../models/User');

class Database {
    constructor(url) {
        mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', () => {
            console.log('Successfully connected to database.');
        }); 
    }

    findUser(id) {
        return User.find({ userid: id }, (err, user) => {
            if (err) throw err;
            if (!user.length) {
                return false;
            } else {
                return user;
            }
        })
    }

    createUser(id) {
        const filter = { userid: id };
        const options = {
            new: true,
            upsert: true,
        }
        return User.findOneAndUpdate(filter, options, (err, user) => {
            if (err) throw err;
            return user;
        });
    }

    clearUsers() {
        return User.deleteMany({}, err => {
            if (err) {
                throw err;
            } else {
                return true;
            };
        });
    }
}

module.exports = Database;