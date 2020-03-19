const Discord = require('discord.js');
const commandController = require('./commandController');
const config = require('./config');

const cmd = commandController();
const client = new Discord.Client();

//Connect to servers
client.on('ready', () => {
    console.log(`Connected as ${client.user.tag}`);
    console.log(`Servers: `);
    client.guilds.forEach((guild) => {
        console.log(` - ${guild.name}`);
    });
});

client.on('message', (message) => {
    //Ignore bots including self.
    if (message.author.bot) return;

    //Process command if incoming message starts with '!'.
    if (message.content.startsWith('!')){
        cmd.processCommand(message);
    }
});

client.login(config.token);