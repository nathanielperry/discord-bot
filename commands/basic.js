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
}