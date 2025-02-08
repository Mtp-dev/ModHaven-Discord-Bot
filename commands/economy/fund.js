const db = require('../../database/db');

module.exports = {
    name: 'fund',
    description: 'Check the total amount in the community fund.',
    async execute(message) {
        try {
            // Fetch total community fund
            const [fundRows] = await db.query('SELECT total_fund FROM community_fund WHERE id = 1');

            if (fundRows.length === 0) {
                return message.reply('The community fund has not been set up yet.');
            }

            const totalFund = fundRows[0].total_fund;
            message.reply(`💰 The current community fund contains **${totalFund} coins**.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the community fund.');
        }
    }
};
