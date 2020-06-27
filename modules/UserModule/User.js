const mongoose = require('mongoose');
mongoose.Promise = Promise;

const UserSchema = mongoose.Schema({
    _id: String,
    coins: { type: Number, default: 0 },
    activity: { type: Number, default: 0 },
});

//Instance Methods
UserSchema.methods.giveCoins = function(amt) {
    this.coins = Math.floor(Math.max(0, this.coins + amt));
    return this.save();
}

UserSchema.methods.getBalance = function() {
    return this.coins;
}

//Static Methods
UserSchema.statics.clearAll = function() {
    return this.deleteMany({});
}

UserSchema.statics.createUser = async function(userId) {
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
        return this.create({ _id: userId });
    } else {
        return false;
    }
}

UserSchema.statics.getUsers = function() {
    return this.find({});
}

UserSchema.statics.getUserById = function(userId) {
    return this.findById(userId);
}

const User = mongoose.model('User', UserSchema);
module.exports = User;