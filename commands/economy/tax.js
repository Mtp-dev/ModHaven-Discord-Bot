const db = require('../../database/db');

module.exports = {
    name: 'tax',
    description: 'Collect tax from all users.',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You do not have permission to collect taxes.');
        }

        const taxRate = parseFloat(args[0]);

        if (isNaN(taxRate) || taxRate <= 0 || taxRate > 50) {
            return message.reply('Please enter a valid tax rate (1-50%). Example: `!tax 10` to collect 10% tax.');
        }

        try {
            // Fetch all users with a balance
            const [users] = await db.query('SELECT user_id, balance FROM economy WHERE balance > 0');

            if (users.length === 0) {
                return message.reply('No users have a balance to tax.');
            }

            let totalCollected = 0;

            for (const user of users) {
                const taxAmount = Math.floor((taxRate / 100) * user.balance);

                if (taxAmount > 0) {
                    await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [taxAmount, user.user_id]);
                    totalCollected += taxAmount;
                }
            }

            message.reply(`💰 Taxes collected! A **${taxRate}%** tax was applied to all users. **${totalCollected} coins** were collected.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing the tax collection.');
        }
    }
};
