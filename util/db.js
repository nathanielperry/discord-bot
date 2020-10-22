const mongoose = require('mongoose');
const events = require('../util/event');

class Database {
    constructor(url) {
        mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', () => {
            console.log('Successfully connected to database.');
            events.emit('db-connected');
        }); 
    }
}

module.exports = Database;