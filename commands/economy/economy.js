const db = require('../../database/db');

module.exports = {
    name: 'balance',
    description: 'Check your balance.',
    async execute(message, args) {
        const userId = message.author.id;

        try {
            // Check if user exists in the database
            const [rows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (rows.length === 0) {
                // Insert user into the database with default balance
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000]);
                return message.reply('You have been added to the economy system with a balance of 1000 coins.');
            }

            const balance = rows[0].balance;
            message.reply(`Your current balance is **${balance} coins**.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching your balance.');
        }
    }
};
