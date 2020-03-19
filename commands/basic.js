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
}