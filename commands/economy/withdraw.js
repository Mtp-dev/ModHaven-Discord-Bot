const db = require('../../database/db');

module.exports = {
    name: 'withdraw',
    description: 'Withdraw coins from your bank account.',
    async execute(message, args) {
        const userId = message.author.id;
        const withdrawAmount = parseInt(args[0], 10);

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            return message.reply('Please enter a valid amount to withdraw.');
        }

        try {
            // Check user's bank balance
            const [userRows] = await db.query('SELECT balance, bank FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].bank < withdrawAmount) {
                return message.reply('You do not have enough coins in your bank to withdraw.');
            }

            // Update bank and balance
            await db.query('UPDATE economy SET balance = balance + ?, bank = bank - ? WHERE user_id = ?', [withdrawAmount, withdrawAmount, userId]);

            message.reply(`🏦 You have successfully withdrawn **${withdrawAmount} coins** from your bank.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your withdrawal.');
        }
    }
};
