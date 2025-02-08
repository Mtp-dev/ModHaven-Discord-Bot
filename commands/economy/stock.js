const db = require('../../database/db');

module.exports = {
    name: 'stock',
    description: 'Invest in the stock market and try to make a profit!',
    async execute(message, args) {
        const userId = message.author.id;
        const investmentAmount = parseInt(args[0], 10);

        if (isNaN(investmentAmount) || investmentAmount <= 0) {
            return message.reply('Please enter a valid amount to invest.');
        }

        try {
            // Check user's balance
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < investmentAmount) {
                return message.reply('You do not have enough coins to invest.');
            }

            // Define possible stock market outcomes
            const stockOutcomes = [
                { text: '📈 Your stocks skyrocketed!', multiplier: Math.random() * 2 + 1.5 }, // Gain 1.5x to 3x
                { text: '📉 The market crashed!', multiplier: Math.random() * -0.5 }, // Lose up to 50%
                { text: '🔄 Your stocks remained stable.', multiplier: 1 } // No change
            ];

            // Pick a random outcome
            const stockResult = stockOutcomes[Math.floor(Math.random() * stockOutcomes.length)];
            const profitOrLoss = Math.floor(investmentAmount * stockResult.multiplier);

            // Update user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [profitOrLoss - investmentAmount, userId]);

            let resultMessage = `📊 **Stock Market Report** 📊\n\n${stockResult.text}\n`;

            if (profitOrLoss > investmentAmount) {
                resultMessage += `🎉 You made a profit of **${profitOrLoss - investmentAmount} coins**!`;
            } else if (profitOrLoss < investmentAmount) {
                resultMessage += `💀 You lost **${investmentAmount - profitOrLoss} coins** in the market crash.`;
            } else {
                resultMessage += `😐 No gains, no losses. Your investment remained the same.`;
            }

            message.reply(resultMessage);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your stock investment.');
        }
    }
};
