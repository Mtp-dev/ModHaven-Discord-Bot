const db = require('../../database/db');

module.exports = {
    name: 'donate',
    description: 'Donate coins to the community fund.',
    async execute(message, args) {
        const userId = message.author.id;
        const donateAmount = parseInt(args[0], 10);

        if (isNaN(donateAmount) || donateAmount <= 0) {
            return message.reply('Please enter a valid amount to donate.');
        }

        try {
            // Check user's balance
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < donateAmount) {
                return message.reply('You do not have enough coins to donate.');
            }

            // Deduct donation from user's balance and add to fund
            await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [donateAmount, userId]);
            await db.query('UPDATE community_fund SET total_fund = total_fund + ? WHERE id = 1');

            message.reply(`💰 You have successfully donated **${donateAmount} coins** to the community fund!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your donation.');
        }
    }
};
