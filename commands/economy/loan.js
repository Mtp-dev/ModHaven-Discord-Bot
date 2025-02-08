const db = require('../../database/db');

module.exports = {
    name: 'loan',
    description: 'Take out a loan that must be repaid with interest.',
    async execute(message, args) {
        const userId = message.author.id;
        const loanAmount = parseInt(args[0], 10);
        const interestRate = 1.2; // 20% interest
        const repaymentAmount = Math.floor(loanAmount * interestRate);

        if (isNaN(loanAmount) || loanAmount <= 0) {
            return message.reply('Please enter a valid loan amount.');
        }

        try {
            // Check if the user exists in the economy system
            const [userRows] = await db.query('SELECT balance, loan FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance, loan) VALUES (?, ?, ?)', [userId, 1000, 0]);
            } else if (userRows[0].loan > 0) {
                return message.reply('You already have an outstanding loan! Repay it before taking another.');
            }

            // Give the loan and update loan balance
            await db.query('UPDATE economy SET balance = balance + ?, loan = ? WHERE user_id = ?', [loanAmount, repaymentAmount, userId]);

            message.reply(`💰 You have taken a loan of **${loanAmount} coins**. You must repay **${repaymentAmount} coins**.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your loan request.');
        }
    }
};
