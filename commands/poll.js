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
                return false;
            } else {
                const question = arg.join(' ');
                const messageEmbed = {
                    title: question,
                    fields: [
                        {
                            name: 'Yes',
                            value: 0,
                        },
                        {
                            name: 'No',
                            value: 0,
                        },
                        {
                            name: `Don't care`,
                            value: 0,
                        },
                    ]
                }
                message.channel.send({ embed: messageEmbed })
                .then(msg => {
                    msg.react('👍')
                    .then(() => { msg.react('👎') })
                    .then(() => { msg.react('🤷') })
                    .then(() => {
                        //Create reaction collector
                        const collector = msg.createReactionCollector((reaction, user) => {
                            return ['👍', '👎', '🤷'].includes(reaction.emoji.name) && user.id !== msg.author.id;
                        }, { time: 10000 });

                        collector.on('collect', (reaction, reactionCollector) => {
                            //On reaction collected
                            getUserVotesArray(reactionCollector);
                            
                        });
                        
                        collector.on('end', (collected) => {
                            //On timer up
                            messageEmbed.footer = {
                                text: 'Poll is now closed!'
                            }
                            msg.edit({ embed: messageEmbed });
                        });
                    });
                });
            }
        }
    },
}