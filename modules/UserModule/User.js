const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userId: String,
});

const User = mongoose.model('User', UserSchema);

module.exports = {
    findUser(id) {
        return User.find({ userId: id }, (err, user) => {
            if (err) throw err;
            return user;
        });
    },

    createUser(id) {
        return User.create({ userId: id }, (err, user) => {
            if (err) throw err;
            return user;
        });
    },

    clearUsers() {
        return User.deleteMany({}, err => {
            if (err) {
                throw err;
            } else {
                return true;
            };
        });
    }
};