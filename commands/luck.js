const { throwCommandError, getCommandAndArgs } = require('../commandHelpers');

module.exports = {
    roll: {
        description: `Roll some dice in the format: "2d6"`,
        help: 
            `Roll sets of dice by specifying the amount of dice and number of faces.
            e.g. "!roll 2d6" will roll 2 6-sided dice.

            Adding '!' to the end of the roll will cause the dice to explode. (Rolling max adds another die to the roll)
            
            You can also roll multiple sets at a time,
            e.g. "!roll 2d6 10d4".
        `,
        run(message, ...dice) {
            const dieExpression = /(\d+)d(\d+)(!?)/;

            dice.forEach((die) => {
                if (!dieExpression.test(die)) {
                    throwCommandError(`${die} is not a valid roll.`);
                }
                const params = dieExpression.exec(die);
                const numDice = params[1];
                const numFaces = params[2];
                const exploding = params[3] === '!';
                let results = [];
                
                if (parseInt(numFaces) === 1 && exploding){
                    throwCommandError(`You rolled: infinity! What a roll!`);
                } else if (parseInt(numDice) > 30) {
                    throwCommandError(`Too many dice!`);
                }

                message.channel.send(
                    `Rolling ${numDice} d${numFaces}${exploding ? ' (Exploding)' : ''}...`
                );
                for (x = 0; x < numDice; x++) {
                    let result = Math.floor(Math.random() * Math.floor(numFaces)) + 1;
                    results.push(result);
                    while (exploding && result === parseInt(numFaces)) {
                        result = Math.floor(Math.random() * Math.floor(numFaces)) + 1;
                        results.push(result);
                    }
                }

                let sum = results.reduce((a, b) => a + b);

                if (results.length > 1) { //multi dice result
                    message.channel.send(`${results.join(' + ')} = ${sum}!`)
                } else { //single die result
                    message.channel.send(`${sum}!`)
                }

                if (sum > 9000) { //It's over 9000!
                    message.channel.send(`It's over nine-thousaaaaaaand!`);
                } else if (sum > 500) { //It's over 500!
                    message.channel.send(`That's a lot of damage!`);
                }
            });
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
                        message.channel.send(`Sorry, ${msg.author}, you didn't call it.`);
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