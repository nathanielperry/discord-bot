const mongoose = require('mongoose');
const { constrainInt } = require('../../util/helpers');
mongoose.Promise = Promise;

const MAXACTIVITY = 6;

const UserSchema = mongoose.Schema({
    _id: String,
    coins: { type: Number, default: 0, min: 0 },
    activity: { type: Number, default: 0, max: MAXACTIVITY },
    dailyStreak: { type: Number, default: 0 },
});

//Instance Methods
UserSchema.methods.giveCoins = function(amt) {
    this.coins = Math.floor(Math.max(0, this.coins + amt));
    return this.save();
}

UserSchema.methods.giveActivity = function(amt) {
    this.activity = constrainInt(0, MAXACTIVITY, this.activity + amt);
    return this.save();
}

UserSchema.methods.setActivity = function(amt) {
    this.activity = Math.max(0, amt);
    return this.save();
}

UserSchema.methods.giveDailyStreak = function(amt) {
    this.dailyStreak = Math.floor(this.dailyStreak + amt);
    return this.save();
}

UserSchema.methods.setDailyStreak = function(amt) {
    this.dailyStreak = amt;
    return this.save();
}

UserSchema.methods.getDailyStreakMultiplier = function() {
    return Math.floor(this.dailyStreak / 5) + 1;
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