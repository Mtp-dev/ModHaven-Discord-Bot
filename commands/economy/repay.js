const db = require('../../database/db');

module.exports = {
    name: 'repay',
    description: 'Repay your outstanding loan.',
    async execute(message, args) {
        const userId = message.author.id;
        const repayAmount = parseInt(args[0], 10);

        if (isNaN(repayAmount) || repayAmount <= 0) {
            return message.reply('Please enter a valid amount to repay.');
        }

        try {
            // Check user's balance and outstanding loan
            const [userRows] = await db.query('SELECT balance, loan FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].loan <= 0) {
                return message.reply('You do not have any outstanding loans to repay.');
            }

            if (repayAmount > userRows[0].loan) {
                return message.reply(`You only owe **${userRows[0].loan} coins**. Please enter a valid amount.`);
            }

            if (repayAmount > userRows[0].balance) {
                return message.reply('You do not have enough coins to repay this amount.');
            }

            // Deduct repayment from balance and reduce loan amount
            await db.query('UPDATE economy SET balance = balance - ?, loan = loan - ? WHERE user_id = ?', [repayAmount, repayAmount, userId]);

            message.reply(`✅ You have repaid **${repayAmount} coins** towards your loan.`);

            // If the loan is fully repaid
            if (userRows[0].loan - repayAmount <= 0) {
                await db.query('UPDATE economy SET loan = 0 WHERE user_id = ?', [userId]);
                message.reply('🎉 Your loan is fully repaid!');
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your loan repayment.');
        }
    }
};
