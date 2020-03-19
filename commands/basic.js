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
}