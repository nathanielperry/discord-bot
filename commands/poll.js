const getUserVotesArray = function(collector) {
    collected = collector.collected;
    console.log(collected);
}

const getLiveResultsString = function() {
    //TODO: Generate and return live results string here 
}

module.exports = {
    poll: {
        description: `Create a poll for a group vote.`,
        help: `
            Create a new poll, either multiple choice or a simple yes or no.
            e.g. "!poll Is ratbot a good bot?"
            For multiple choice: "!poll {title} [option 1] [option 2] [option 3] etc."
        `,
        run(message, ...arg) {
            if (arg[0].match(/{.+}/)) {
                //TODO: Implement multi choice poll here
                return false;
            } else {
                //Set question to first line of bot message
                const messageArray = [];
                messageArray[0] = arg.join(' ');
                message.channel.send(messageArray)
                .then(msg => {
                    msg.react('👍')
                    .then(() => { msg.react('👎') })
                    .then(() => { msg.react('🤷') })
                    .then(() => {
                        //TODO: Replace message generation here with live results string function
                        messageArray[1] = '```';
                        messageArray[2] = `Now accepting responses! Poll will close after 1 minute.`;
                        messageArray[3] = '```';
                        msg.edit(messageArray);
                        const collector = msg.createReactionCollector((reaction, user) => {
                            return ['👍', '👎', '🤷'].includes(reaction.emoji.name) && user.id !== msg.author.id;
                        }, { time: 10000 });

                        collector.on('collect', (reaction, reactionCollector) => {
                            getUserVotesArray(reactionCollector);
                            messageArray[3] = `YES: X, NO: X, UNDECIDED: X`;
                            messageArray[4] = '```';
                            msg.edit(messageArray);
                        });
                        
                        collector.on('end', (collected) => {
                            messageArray[4] = `The poll is now closed!`;
                            messageArray[5] = '```';
                            msg.edit(messageArray);
                        });
                    });
                });
            }
        }
    },
}