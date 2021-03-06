const Middleware = require('./util/middleware');
const Discord = require('discord.js');
const Database = require('./util/db');
const CronJob = require('cron').CronJob;
const dfns = require('date-fns');
const events = require('./util/event');

//Temporary solution to catch promise errors.
//TODO: Refactor error handling to account for async commands.
process.on('unhandledRejection', (err) => {
    if (err.name === 'userError') {
        err.message.channel.send(err.errorMessage);
    } else {
        // err.message.channel.send(`Looks like there was an uncaught error. Ping your channel admin to let them know!`)
        console.error(err);
    }
});

class Bot {
    constructor() {
        this.client = new Discord.Client();
        this.handlers = new Middleware();
        this.db = new Database(process.env.MONGODB);

        //Setup event listeners
        this.client.on('ready', () => {
            console.log(`Connected as ${this.client.user.tag}.`);
            console.log(`Servers: `);
            this.client.guilds.cache.forEach((guild) => {
                console.log(` - ${guild.name}`);
            });
            events.emit('bot-connected');
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

    addMessageHandler(subHandlers, ejectHandler) {
        //Create new handler stack
        const handler = new Middleware();
        subHandlers.forEach(h => {
            handler.use(h);
        });

        //Add to main handler stack.
        this.handlers.use((message, next) => {
            const result = handler.run(message);
            //If handler is ejected, run ejectHandler instead of next subHandler.
            if (!result.ejected) {
                next();
            } else if (ejectHandler) {
                ejectHandler(message, next);
            } else {
                return false;
            }
        });
    }

    redirect(subHandlers) {
        //Create and run new handler / redirect
        const handler = new Middleware();
        subHandlers.forEach(h => {
            handler.use(h);
        });

        handler.run(message);
    }

    addScheduledTask(title, time, fn) {
        const job = new CronJob(time, function() {
            console.log(`-- Running Scheduled Task: ${title} @ ${dfns.format(Date.now(), 'h:mm:ss')} --`);
            fn();
        }, null, true);
    }

    login() {
        this.client.login(process.env.DISCORD_TOKEN);
    }
}

module.exports = Bot;