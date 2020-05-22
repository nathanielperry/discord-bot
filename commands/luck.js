const { getCommandAndArgs } = require('../util/commandHelpers');

module.exports = {
    roll: {
        hide: true,
        run(message) {
            message.channel.send(`The !roll command has been deprecated. You can now roll dice by typing \`${process.env.PREFIX}d6\`, \`${process.env.PREFIX}3d8\`, \`${process.env.PREFIX}2d6 d10! 3d4\`, etc.  Add '!' at end for Acing/Exploding dice.`)
        }
    },
    flip: {
        description: `Flip a coin.`,
        help: `
            Flips a coin, giving heads or tails. 
            Run with the 'call' argument and it will wait for someone to
            call the flip with the !call command first.
        `,
        run(message, arg) {
            message.channel.send(`Flipping a coin...`);
            const flipResult = Math.random() >= 0.5 ? 'Heads' : 'Tails';
            let call = null;

            if (arg === 'call') {
                message.channel.send('Someone call it! e.g. "!call heads". You have 30 seconds.');
                const collector = message.channel.createMessageCollector(msg => {
                    const { command, args } = getCommandAndArgs(msg);
                    return command === 'call' && (args[0] === 'heads' || args[0] === 'tails');
                }, { time: 30000, errors: ['time'] });

                collector.on('collect', msg => {
                    const { args } = getCommandAndArgs(msg);
                    call = args[0].toLowerCase();
                    collector.stop();
                });
                
                collector.on('end', collected => {
                    const caller = collected.first() ? collected.first().author : null;
                    message.channel.send(`The result is: ${flipResult}!`);

                    if (caller && call === flipResult.toLowerCase()) {
                        message.channel.send(`${caller} called it! Nice!`);
                    } else if (caller && call !== flipResult.toLowerCase()) {
                        message.channel.send(`Sorry, ${caller}, you didn't call it.`);
                    } else {
                        message.channel.send(`Nobody called it in time.`);
                    }
                });
            } else {
                message.channel.send(`The result is: ${flipResult}!`);
            }
        }
    },
    call: {
        description: `Call a flipped coin.`,
        help: `
            Call a flipped coin! Accepts heads or tails.
            e.g. "!call heads".
            Only useful if a flip command was used with the 'call' argument first.
        `,
        run(message, arg) {
            //Does nothing by itself, actual call behavior is handled in flip command.
            return false;
        }
    }
}