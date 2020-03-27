const getUserVoteResultFields = function(collected) {
    const counts = {
        yes: collected.get('👍') ? collected.get('👍').count - 1 : 0,
        no: collected.get('👎') ? collected.get('👎').count - 1 : 0,
        shrug: collected.get('🤷') ? collected.get('🤷').count - 1 : 0,
    }

    return [
        {
            name: 'Results',
            value: `YES: ${counts.yes} / NO: ${counts.no} / SHRUG: ${counts.shrug}`,
        },
    ]
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
            if (arg[0].match(/{.+}/)) {
                message.channel.send('Multiple choice polling not yet implemented. Sorry!');
                return false;
            } else {
                const question = arg.join(' ');
                const messageEmbed = {
                    title: question,
                    fields: [
                        { name: 'Results', value: 'Pending'}
                    ],
                    footer: {
                        text: 'Vote now!'
                    }
                }
                message.channel.send({ embed: messageEmbed })
                .then(msg => {
                    msg.react('👍')
                    .then(() => { msg.react('👎') })
                    .then(() => { msg.react('🤷') })
                    .then(() => {
                        //Array to track users that already voted
                        const alreadyVoted = [];

                        //Create reaction collector
                        const collector = msg.createReactionCollector((reaction, user) => {
                            if (alreadyVoted.includes(user.id)) {
                                //User already voted in this poll
                                //Reject reaction
                                return false;
                            } else if (['👍', '👎', '🤷'].includes(reaction.emoji.name) && user.id !== msg.author.id) {
                                //User selected appropriate emoji
                                //Add user id to alreadyVoted array
                                alreadyVoted.push(user.id);
                                //Collect reaction
                                return true;
                            }
                        }, { time: 30000 });
                        
                        collector.on('end', (collected) => {
                            //On timer up
                            messageEmbed.fields = getUserVoteResultFields(collected);
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