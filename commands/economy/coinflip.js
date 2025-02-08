const db = require('../../database/db');

module.exports = {
    name: 'coinflip',
    description: 'Flip a coin and bet on heads or tails!',
    async execute(message, args) {
        const userId = message.author.id;
        const betAmount = parseInt(args[1], 10);
        const choice = args[0]?.toLowerCase(); // User's choice: "heads" or "tails"

        if (!['heads', 'tails'].includes(choice)) {
            return message.reply('Please choose **heads** or **tails** and specify a bet amount. Example: `!coinflip heads 100`');
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

            // Simulate coin flip
            const outcomes = ['heads', 'tails'];
            const result = outcomes[Math.floor(Math.random() * outcomes.length)];

            let winnings = 0;
            let resultMessage = `🪙 **The coin landed on:** **${result.toUpperCase()}**!\n`;

            if (result === choice) {
                winnings = betAmount * 2; // Double the bet on win
                resultMessage += `🎉 You won **${winnings} coins**!`;
            } else {
                winnings = -betAmount; // Lose the bet
                resultMessage += `💀 You lost **${betAmount} coins**. Better luck next time!`;
            }

            // Update user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [winnings, userId]);

            message.reply(resultMessage);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your coin flip.');
        }
    }
};
