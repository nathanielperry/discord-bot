const mongoose = require('mongoose');

class Database {
    constructor(url) {
        mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', () => {
            console.log('Successfully connected to database.');
        }); 
    }
}

module.exports = Database;