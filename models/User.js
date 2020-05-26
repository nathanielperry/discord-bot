const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userid: String,
    economy: { type: Number, default: 0 },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;