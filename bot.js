const Middleware = require('./util/middleware');
const Discord = require('discord.js');
const Database = require('./util/db');
const schedule = require('node-schedule');

class Bot {
    constructor() {
        this.client = new Discord.Client();
        this.handlers = new Middleware();
        this.db = new Database(process.env.MONGODB);

        //Setup event listeners
        this.client.on('ready', () => {
            console.log(`Connected as ${this.client.user.tag}.`);
            console.log(`Servers: `);
            this.client.guilds.forEach((guild) => {
                console.log(` - ${guild.name}`);
            });
        });
        
        this.client.on('message', (message) => {
            try {
                this.handlers.run(message);
            } catch (err) {
                if (err.name === 'userError') {
                    message.channel.send(err.message);
                } else {
                    message.channel.send(`Looks like there was an uncaught error. Ping your channel admin to let them know!`)
                    console.error(err);
                }
            }
        });
    }

    addMessageHandler(subHandlers) {
        //Create new handler stack
        const handler = new Middleware();
        subHandlers.forEach(h => {
            handler.use(h);
        });

        //Add to main handler stack.
        this.handlers.use((message, next) => {
            handler.run(message);
            next();
        });
    }

    addScheduledTask(time, fn) {
        schedule.scheduleJob(time, fn);
    }

    login() {
        this.client.login(process.env.DISCORD_TOKEN);
    }
}

module.exports = Bot;