const { throwCommandError, createMultiChoiceEmbedFields, reactInSequence, sendControllerDM } = require('../util/commandHelpers');
const dateFns = require('date-fns');

const activePollUsers = [];
let pollId = 0;

const getLongestStringLength = function(stringArray) {
    return stringArray.reduce((a, b) => (a.length > b.length ? a : b), '').length;
}

const generatePoll = function (author, channel, title, options, duration = 5 * 60000) {
    //Accepts options list and then generates new poll.
    //EXAMPLE:
    //generatePoll(channel, 'Question goes here', [
        //  { emoji: '👍', name: 'Yes' },
        //  { emoji: '👎', name: 'No' },
        //  { emoji: '🤷', name: 'Shrug' },
    //]);

    const poll = {
        id: pollId++,
        closeDate: Date.now() + duration,
        alreadyVoted: [],
        beginMessageEmbed: {
            title,
            fields: createMultiChoiceEmbedFields(options),
            footer: {
                text: '',
            }
        },
    }

    //Send message and react to it with options list
    channel.send({ embed: poll.beginMessageEmbed })
    .then(async msg => {        
        //Create new reaction collector and await reactions
        poll.collector = msg.createReactionCollector((reaction, user) => {
            if (poll.alreadyVoted.includes(user.id)) {
                //User already voted in this poll
                //Reject reaction
                return false;
            } else if (options.map((opt) => opt.emoji).includes(reaction.emoji.name) && user.id !== msg.author.id) {
                //User selected appropriate emoji and has not already voted
                //Add user id to alreadyVoted array
                poll.alreadyVoted.push(user.id);
                //Collect reaction
                return true;
            }
        });

        //Send controller for ending or extending poll
        poll.pollController = sendControllerDM(author, {
            title: 'Poll Controller',
            description: 'Press 🚫 to close the poll and display the results!',
            closedDescription: 'The poll has been closed.',
            commands: [
                { command: 'close', callback: function() {
                    poll.closeDate = Date.now();
                }},
                { command: 'extend', help: 'Extend the poll length by X minutes, e.g. "!extend 10"', callback: function(msg, dur) {
                    poll.closeDate += dur * 60000;
                    msg.channel.send(`Poll Extended to ${dateFns.format(poll.closeDate, 'hh:mm aa')}`);
                }},
            ],
            buttons: [
                { emoji: '🚫', name:'Close Poll', callback: function() {
                    poll.closeDate = Date.now();
                }},
            ],
            hideButtonKey: true,
        });

        poll.pollController.then(ctrl => {
            //Update time to close in message and check if poll should be closed due to timeout
            poll.pollInterval = setInterval(() => {
                if (!poll.collector.ended && Date.now() >= poll.closeDate) {
                    ctrl.close();
                    poll.collector.stop();
                    //Remove user from active list
                    activePollUsers.splice(
                        activePollUsers.indexOf(author.id), 1
                    );
                } else {
                    poll.beginMessageEmbed.footer.text = `Vote now! The poll will automatically close in ${dateFns.formatDistance(Date.now(), poll.closeDate)}.`;
                    msg.edit({ embed: poll.beginMessageEmbed });
                }

                if (poll.collector.ended) {
                    clearInterval(poll.pollInterval);
                }
            }, 1000);
        });

        //On collector end, edit message with results
        poll.collector.on('end', (collected) => {
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
            
            if (!pollString) {
                throwCommandError("Must include a poll title/question.");
                return false;
            }

            if (activePollUsers.length > 0) {
                throwCommandError(
                    "Max one active poll at a time while this feature continues to be updated."
                    + "\n Sorry for the inconvenience!"
                );
                return false;
            }

            activePollUsers.push(message.author.id);

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
                        throwCommandError(`You must have more than one option for a multiple choice poll.`);
                    } else if (optionNames.length > 9) {
                        throwCommandError(`Multi-choice poll cannot have more than 9 choices.`);
                    }
                    
                    //Create option objects and assign number emojis
                    const options = optionNames.map((name, i) => {
                        return {
                            name,
                        }
                    });
    
                    generatePoll(message.author, message.channel, title, options);
                } else {
                    throwCommandError('Poll request contains curly or square braces but is not formmated correctly for a multi-choice poll.');
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