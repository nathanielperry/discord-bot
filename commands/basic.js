const { getCommandAndArgs } = require('../commandHelpers');

module.exports = {
    test: {
        description: `Just a test command! Nothing to see here!`,
        help: `
            Just a test command! Nothing to see here!
        `,
        hide: true,
        run(message, arg) {
            message.channel.send('You ran the test command! Good job!');
            if (arg === 'error') {
                throw "Generated a fake error!";
            }
        }
    },
    say: {
        description: `Repeat some words.`,
        help: `
            Says whatever is after the command.
        `,
        run(message, ...args) {
            message.channel.send(args.join(' '));
        }
    },
    sayin: {
        description: `Robot says something some time later.`,
        help: `
            Says something X seconds later.
            e.g. "!sayin 10 Hello World!" makes the robot say:
            "Hello World!" after waiting 10 seconds.
        `,
        run(message, time, ...args) {
            const n = Math.floor(Number(time));
            if (n !== Infinity && String(n) === time && n > 0){
                setTimeout(() => {
                    message.channel.send(args.join(' '));
                }, n * 1000)
            } else {
                message.channel.send(`${time} is not a whole number greater than 0.`);
            }
        }
    },
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
                    message.channel.send(`${die} is not a valid roll.`);
                    return;
                }
                const params = dieExpression.exec(die);
                const numDice = params[1];
                const numFaces = params[2];
                const exploding = params[3] === '!';
                let results = [];
                
                if (parseInt(numFaces) === 1 && exploding){
                    message.channel.send(`Are you trying to kill me?`);
                    return;
                } else if (parseInt(numDice) > 30) {
                    message.channel.send(`Nobody needs to roll that much dice.`);
                    return;
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
            flipResult = Math.random() >= 0.5 ? 'Heads' : 'Tails';
            if (arg === 'call') {
                message.channel.send('Someone call it! e.g. "!call heads". You have 30 seconds.');
                message.channel.awaitMessages(msg => {
                    const { command, args } = getCommandAndArgs(msg);
                    return command === 'call' && (args[0] === 'heads' || args[0] === 'tails');
                }, { max: 1, time: 30000, errors: ['time'] })
                .then(collected => {
                    message.channel.send(`The result is: ${flipResult}!`);
                    const msg = collected.first();
                    const { args } = getCommandAndArgs(msg);

                    if (args[0].toLowerCase() === flipResult.toLowerCase()) {
                        message.channel.send(`${msg.author} called it! Nice!`);
                    } else {
                        message.channel.send(`Sorry, ${msg.author}, you didn't call it.`);
                    }
                }).catch(error => {
                    console.log(error);
                    message.channel.send(`The result is: ${flipResult}!`);
                    message.channel.send(`Nobody called it in time.`);
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
            //Does nothing, actual call behavior is handled in flip command.
            return false;
        }
    }
}