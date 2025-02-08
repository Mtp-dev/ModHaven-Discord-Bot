const db = require('../../database/db');

module.exports = {
    name: 'dice',
    description: 'Roll a dice and bet on the outcome!',
    async execute(message, args) {
        const userId = message.author.id;
        const betAmount = parseInt(args[1], 10);
        const chosenNumber = parseInt(args[0], 10);

        if (isNaN(chosenNumber) || chosenNumber < 1 || chosenNumber > 6) {
            return message.reply('Please choose a number between **1 and 6** to bet on. Example: `!dice 3 100`');
        }

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Please enter a valid amount to bet.');
        }

        try {
            // Check user's balance
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < betAmount) {
                return message.reply('You do not have enough coins to bet.');
            }

            // Roll a dice (1-6)
            const diceResult = Math.floor(Math.random() * 6) + 1;

            let winnings = 0;
            let resultMessage = `🎲 **Dice Roll** 🎲\n\nThe dice landed on **${diceResult}**!\n`;

            if (diceResult === chosenNumber) {
                winnings = betAmount * 5; // Win 5x the bet
                resultMessage += `🎉 **Congratulations! You won ${winnings} coins!**`;
            } else {
                winnings = -betAmount;
                resultMessage += `💀 **You lost ${betAmount} coins. Better luck next time!**`;
            }

            // Update user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [winnings, userId]);

            message.reply(resultMessage);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your dice game.');
        }
    }
};
