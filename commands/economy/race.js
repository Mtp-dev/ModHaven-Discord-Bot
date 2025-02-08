const db = require('../../database/db');

module.exports = {
    name: 'race',
    description: 'Bet on a race and see if you win or lose!',
    async execute(message, args) {
        const userId = message.author.id;
        const betAmount = parseInt(args[0], 10);
        const racers = ['🐎 Horse', '🏎️ Car', '🚲 Bicycle', '🚗 Sports Car', '🛵 Scooter'];

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Please enter a valid amount to bet.');
        }

        try {
            // Check user's balance
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < betAmount) {
                return message.reply('You do not have enough coins to bet.');
            }

            // Pick a random racer
            const playerRacer = racers[Math.floor(Math.random() * racers.length)];
            const opponentRacer = racers[Math.floor(Math.random() * racers.length)];

            let resultMessage = `🏁 **Race Results** 🏁\n\n` +
                `**You chose:** ${playerRacer}\n` +
                `**Opponent chose:** ${opponentRacer}\n\n`;

            let winnings = 0;
            const win = Math.random() < 0.5; // 50% chance to win

            if (win) {
                winnings = betAmount * 2;
                resultMessage += `🎉 **Your ${playerRacer} won the race! You won ${winnings} coins!**`;
            } else {
                winnings = -betAmount;
                resultMessage += `💀 **Your ${playerRacer} lost the race. You lost ${betAmount} coins.**`;
            }

            // Update user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [winnings, userId]);

            message.reply(resultMessage);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your race bet.');
        }
    }
};
