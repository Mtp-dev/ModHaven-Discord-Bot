const db = require('../../database/db');

module.exports = {
    name: 'daily',
    description: 'Claim your daily reward.',
    async execute(message) {
        const userId = message.author.id;
        const dailyAmount = 500; // Amount awarded daily

        try {
            // Check if user exists in the database
            const [rows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (rows.length === 0) {
                // Insert user with default balance + daily reward
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000 + dailyAmount]);
                return message.reply(`You have been added to the economy system and received **${dailyAmount} coins** as your first daily reward!`);
            }

            // Update user's balance
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [dailyAmount, userId]);
            message.reply(`You have claimed your daily reward of **${dailyAmount} coins**!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error claiming your daily reward.');
        }
    }
};
