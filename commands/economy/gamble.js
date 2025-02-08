const db = require('../../database/db');

module.exports = {
    name: 'gamble',
    description: 'Gamble coins for a chance to win more or lose them.',
    async execute(message, args) {
        const userId = message.author.id;
        const betAmount = parseInt(args[0], 10);

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Please enter a valid amount to gamble.');
        }

        try {
            // Check user's balance
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < betAmount) {
                return message.reply('You do not have enough coins to gamble this amount.');
            }

            // Determine win or lose (50% chance)
            const win = Math.random() < 0.5;
            let resultMessage = '';

            if (win) {
                // Double the bet amount if they win
                const winnings = betAmount * 2;
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [betAmount, userId]);
                resultMessage = `🎉 You won **${winnings} coins**!`;
            } else {
                // Deduct bet amount if they lose
                await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [betAmount, userId]);
                resultMessage = `💀 You lost **${betAmount} coins**. Better luck next time!`;
            }

            message.reply(resultMessage);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your gamble.');
        }
    }
};
