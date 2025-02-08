const db = require('../../database/db');

module.exports = {
    name: 'withdrawfund',
    description: 'Withdraw coins from the community fund (Admin only).',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You do not have permission to withdraw from the community fund.');
        }

        const withdrawAmount = parseInt(args[0], 10);

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            return message.reply('Please enter a valid amount to withdraw.');
        }

        try {
            // Fetch total fund
            const [fundRows] = await db.query('SELECT total_fund FROM community_fund WHERE id = 1');

            if (fundRows.length === 0 || fundRows[0].total_fund < withdrawAmount) {
                return message.reply('There are not enough coins in the community fund to withdraw this amount.');
            }

            // Deduct from fund
            await db.query('UPDATE community_fund SET total_fund = total_fund - ? WHERE id = 1');

            message.reply(`🏦 **${withdrawAmount} coins** have been withdrawn from the community fund.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing the withdrawal.');
        }
    }
};
