const { throwUserError } = require('../util/commandHelpers');

const rollDice = (diceString) => {
    const dieExpression = /(\d*)d(\d+)(!?)/;
    const dice = diceString.split(/[\s]/);

    return dice.map((die) => {
        if (!dieExpression.test(die)) {
            throwUserError(`${die} is not a valid roll.`);
        }
        const params = dieExpression.exec(die);
        const numDice = params[1] || 1;
        const numFaces = params[2];
        const exploding = params[3] === '!';
        let results = [];

        if (parseInt(numFaces) <= 0) {
            throwUserError(`Sorry, I don't how to roll a 0 sided die!`);
        } else if (parseInt(numFaces) === 1 && exploding){
            throwUserError(`You rolled: infinity! What a roll!`);
        } else if (parseInt(numDice) > 20) {
            throwUserError(`Too many dice! Please don't roll more than 20 at a time..`);
        }

        for (x = 0; x < numDice; x++) {
            let result = Math.floor(Math.random() * Math.floor(numFaces)) + 1;
            results.push(result);
            while (exploding && result === parseInt(numFaces)) {
                result = Math.floor(Math.random() * Math.floor(numFaces)) + 1;
                results.push(result);
            }
        }
        
        const sum = results.reduce((a, b) => a + b);
        
        let resultString = `\`Rolling ${numDice}d${numFaces}\`${exploding ? ' (Exploding)' : ''}: `;
        if (results.length > 1) { //multi dice result
            resultString += `${results.join(' + ')} = **\`${sum}\`**`;
        } else { //single die result
            resultString += `**\`${sum}\`**`;
        }

        return resultString;
    });
}

module.exports = (prefix = process.env.PREFIX) => {
    const regex = new RegExp('^' + prefix + '(\\d+d\\d+|d\\d+)');
    return (message, next) => {
        if (regex.test(message.content)) {
            const results = rollDice(message.content.replace(new RegExp('^' + prefix), ''));
            results.forEach(res => {
                message.channel.send(res);
            });
            return true;
        }
        
        next();
    }
}