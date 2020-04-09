const { createMultiChoiceEmbedFields, reactInSequence, sendControllerDM } = require('./../commandHelpers');

const getLongestStringLength = function(stringArray) {
    return stringArray.reduce((a, b) => (a.length > b.length ? a : b), '').length;
}

const generatePoll = function (author, channel, title, options, duration = 60000 * 10) {
    //Accepts options list and then generates new poll.
    //EXAMPLE:
    //generatePoll(channel, 'Question goes here', [
        //  { emoji: '👍', name: 'Yes' },
        //  { emoji: '👎', name: 'No' },
        //  { emoji: '🤷', name: 'Shrug' },
    //]);

    const pollBeginMessageEmbed = {
        title,
        fields: createMultiChoiceEmbedFields(options),
        footer: { 
            text: 'Vote now! The poll is currently open. Only your first reaction will be counted.',
        }
    }

    //Send message and react to it with options list
    channel.send({ embed: pollBeginMessageEmbed })
    .then(async msg => {
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

        //Send controller for ending or extending poll
        sendControllerDM(author, {
            title: 'Poll Controller',
            description: 'Press 🚫 to close the poll and display the results!',
            closedDescription: 'The poll has been closed.',
            commands: [
                { command: 'close', callback: function() {
                    collector.stop();
                    this.close(); 
                }},
                { command: 'extend', help: 'Extend the poll length by 10 minutes', callback: () => null },
            ],
            buttons: [
                { emoji: '🚫', name:'Close Poll', callback: function() {
                    collector.stop();
                    this.close(); 
                }},
            ],
            hideButtonKey: true,
        });

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

        //React to post with each option emoji in sequence
        //Use reduce function to create dynamic promise chain based on options list
        return reactInSequence(msg, options.map(option => option.emoji));
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
                        }
                    });
    
                    generatePoll(message.author, message.channel, title, options);
                } else {
                    message.channel.send('Poll request contains curly or square braces but is not formmated correctly for a multi-choice poll.');
                }
            } else {
                const title = pollString;
                generatePoll(message.author, message.channel, title, [
                     { emoji: '👍', name: 'Yes' },
                     { emoji: '👎', name: 'No' },
                     { emoji: '🤷', name: 'Shrug' },
                ]);
            }
        }
    },
}