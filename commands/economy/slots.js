const db = require('../../database/db');

module.exports = {
    name: 'slots',
    description: 'Play the slot machine to win or lose coins!',
    async execute(message, args) {
        const userId = message.author.id;
        const betAmount = parseInt(args[0], 10);
        const slotSymbols = ['🍒', '🍋', '🍇', '🍉', '🔔', '⭐', '7️⃣'];

        if (isNaN(betAmount) || betAmount <= 0) {
            return message.reply('Please enter a valid amount to bet.');
        }

        try {
            // Check user's balance
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < betAmount) {
                return message.reply('You do not have enough coins to play.');
            }

            // Generate slot results
            const slot1 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            const slot2 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
            const slot3 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];

            let winnings = 0;
            let resultMessage = `🎰 **Slot Machine Results** 🎰\n${slot1} | ${slot2} | ${slot3}\n`;

            // Win conditions
            if (slot1 === slot2 && slot2 === slot3) {
                winnings = betAmount * 3; // Triple the bet on jackpot
                resultMessage += `🎉 Jackpot! You won **${winnings} coins**!`;
            } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
                winnings = betAmount * 2; // Double the bet on two matches
                resultMessage += `✨ Nice! You won **${winnings} coins**!`;
            } else {
                winnings = -betAmount; // Lose the bet
                resultMessage += `💀 You lost **${betAmount} coins**. Better luck next time!`;
            }

            // Update user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [winnings, userId]);

            message.reply(resultMessage);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your slot game.');
        }
    }
};
