const getLongestStringLength = function(stringArray) {
    return stringArray.reduce((a, b) => (a.length > b.length ? a : b), '').length;
}

const generatePoll = function (channel, title, options, duration = 30000) {
    //Accepts options list and then generates new poll.
    //EXAMPLE:
    //generatePoll(channel, 'Question goes here', [
        //  { emoji: '👍', name: 'Yes' },
        //  { emoji: '👎', name: 'No' },
        //  { emoji: '🤷', name: 'Shrug' },
    //]);

    //Group options into columns of size, colSize
    let optionGroups = [];
    const colSize = 3;
    for (let i = 0; i < options.length; i += colSize) {
        optionGroups.push(options.slice(i, i + colSize));
    }
    
    //Build message embed detailing options
    let pollBeginMessageEmbed = {
        title,
        //For each column, create an inline field with those options
        fields: optionGroups.map((group, i) => {
            return {
                name: i < 1 ? 'Options' : '--',
                value: group.map(opt => {
                    return opt.emoji + ' ' + opt.name;
                }).join('\n\n'),
                inline: true,
            }
        }),
        footer: { 
            text: 'Vote now! Only the first vote per person is counted.',
        }
    }
    
    //Send message and react to it with options list
    channel.send({ embed: pollBeginMessageEmbed })
    .then(async msg => {
        //Send each reaction in sequence
        //Use reduce function to create dynamic promise chain based on options list
        await options.reduce(
            (p, option) => p.then(() => msg.react(option.emoji)),
            Promise.resolve(null)
        );

        return msg;
    })
    .then(msg => {
        //Create array to track users that already voted
        const alreadyVoted = [];
        
        //Create new reaction collector and await reactions
        const collector = msg.createReactionCollector((reaction, user) => {
            if (alreadyVoted.includes(user.id)) {
                //User already voted in this poll
                //Reject reaction
                return false;
            } else if (options.map((opt) => opt.emoji).includes(reaction.emoji.name) && user.id !== msg.author.id) {
                //User selected appropriate emoji and has not already voted
                //Add user id to alreadyVoted array
                alreadyVoted.push(user.id);
                //Collect reaction
                return true;
            }
        }, { time: duration });

        //On collector end, edit message with results
        collector.on('end', (collected) => {
            //On timer up
            //Add reaction count to each option of options array
            const talliedOptions = options.map(option => {
                return Object.assign({ ...option }, {
                    count: collected.get(option.emoji) ? collected.get(option.emoji).count - 1 : 0,
                });
            });

            //Create embed message showing results
            const padLength = getLongestStringLength(talliedOptions.map((opt) => opt.name));
            const pollEndMessageEmbed = {
                title,
                fields: [
                    {
                        name: 'Results',
                        value: '```' + talliedOptions.map((option) => {
                            return option.name.padEnd(padLength, ' ') + ' : ' + option.count.toString().padStart(2, ' ');
                        }).join('\n') + '```',
                        code: true,
                    }
                ],
                footer: {
                    text: 'Poll is now closed and the results are in!',
                }
            }

            msg.edit({ embed: pollEndMessageEmbed });
        });
    });


}

module.exports = {
    poll: {
        description: `Create a poll for a group vote.`,
        help: `
            Create a new poll, either multiple choice or a simple yes or no.
            e.g. "!poll Is ratbot a good bot?"
            For multiple choice: "!poll {title} [option 1] [option 2] [option 3] etc."
            NOTE: Multiple choise not yet implemented.
        `,
        run(message, ...arg) {
            const pollString = arg.join(' ');
            if (pollString.match(/[{}\[\]]/)) {
                /* Test as multi-choice if 
                request contains any curly 
                braces or square brackets */
                if (pollString.match(/{(.+?)}\s*\[.+\]/)) {
                    const numberEmojis = [
                        "\u0030\u20E3",
                        "\u0031\u20E3",
                        "\u0032\u20E3",
                        "\u0033\u20E3",
                        "\u0034\u20E3",
                        "\u0035\u20E3",
                        "\u0036\u20E3",
                        "\u0037\u20E3",
                        "\u0038\u20E3",
                        "\u0039\u20E3",
                    ];
    
                    //If message matches multi-choice poll format
                    //Get title between curly braces 
                    const title = pollString.match(/{(.+?)}/)[1];
                    
                    //Get all bracket pairs and map contents to array
                    const optionNames = arg
                        .join(' ')
                        .match(/\[.+?\]/g)
                        .map(name => name.replace(/[\[\]]/g, ''));
    
                    //Check if there are more than 1 and less than 10 options.
                    if (optionNames.length <= 1) {
                        message.channel.send(`You must have more than one option for a multiple choice poll.`);
                        return false;
                    } else if (optionNames.length > 9) {
                        message.channel.send(`Multi-choice poll cannot have more than 9 choices.`);
                        return false;
                    }
                    
                    //Create option objects and assign number emojis
                    const options = optionNames.map((name, i) => {
                        return {
                            name,
                            emoji: numberEmojis[i + 1],
                        }
                    });
    
                    generatePoll(message.channel, title, options);
                } else {
                    message.channel.send('Poll request contains curly or square braces but is not formmated correctly for a multi-choice poll.');
                }
            } else {
                const title = pollString;
                generatePoll(message.channel, title, [
                     { emoji: '👍', name: 'Yes' },
                     { emoji: '👎', name: 'No' },
                     { emoji: '🤷', name: 'Shrug' },
                ]);
            }
        }
    },
}