const db = require('../../database/db');

module.exports = {
    name: 'roulette',
    description: 'Bet on red, black, or green and spin the roulette wheel!',
    async execute(message, args) {
        const userId = message.author.id;
        const betColor = args[0]?.toLowerCase();
        const betAmount = parseInt(args[1], 10);
        const validColors = ['red', 'black', 'green'];

        if (!validColors.includes(betColor)) {
            return message.reply('Please bet on **red, black, or green**. Example: `!roulette red 100`');
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

            // Simulate the roulette spin
            const colors = ['red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'green']; // Green is rare
            const resultColor = colors[Math.floor(Math.random() * colors.length)];

            let winnings = 0;
            let resultMessage = `🎡 **Roulette Spin** 🎡\n\nThe wheel landed on **${resultColor.toUpperCase()}**!\n`;

            if (betColor === resultColor) {
                if (resultColor === 'green') {
                    winnings = betAmount * 14; // Green pays 14x
                    resultMessage += `🎉 **Jackpot! You won ${winnings} coins!**`;
                } else {
                    winnings = betAmount * 2; // Red & Black pay 2x
                    resultMessage += `✨ **You won ${winnings} coins!**`;
                }
            } else {
                winnings = -betAmount;
                resultMessage += `💀 **You lost ${betAmount} coins. Better luck next time!**`;
            }

            // Update user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [winnings, userId]);

            message.reply(resultMessage);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your roulette game.');
        }
    }
};
