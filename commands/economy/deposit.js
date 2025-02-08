const db = require('../../database/db');

module.exports = {
    name: 'deposit',
    description: 'Deposit coins into your bank account.',
    async execute(message, args) {
        const userId = message.author.id;
        const depositAmount = parseInt(args[0], 10);

        if (isNaN(depositAmount) || depositAmount <= 0) {
            return message.reply('Please enter a valid amount to deposit.');
        }

        try {
            // Check user's balance
            const [userRows] = await db.query('SELECT balance, bank FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < depositAmount) {
                return message.reply('You do not have enough coins to deposit.');
            }

            // Update balance and bank
            await db.query('UPDATE economy SET balance = balance - ?, bank = bank + ? WHERE user_id = ?', [depositAmount, depositAmount, userId]);

            message.reply(`🏦 You have successfully deposited **${depositAmount} coins** into your bank.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your deposit.');
        }
    }
};
