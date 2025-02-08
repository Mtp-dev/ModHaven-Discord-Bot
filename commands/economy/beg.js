const db = require('../../database/db');

module.exports = {
    name: 'beg',
    description: 'Beg for coins and see if someone gives you money!',
    async execute(message) {
        const userId = message.author.id;

        try {
            // Check if user exists in economy table
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000]);
            }

            // Possible outcomes of begging
            const outcomes = [
                { text: 'A kind stranger gave you some coins!', amount: Math.floor(Math.random() * 300) + 50, success: true },
                { text: 'No one paid attention to your begging.', amount: 0, success: false },
                { text: 'A rich person felt generous and gave you a big tip!', amount: Math.floor(Math.random() * 1000) + 300, success: true },
                { text: 'Someone laughed at you and walked away.', amount: 0, success: false },
            ];

            // Choose a random outcome
            const result = outcomes[Math.floor(Math.random() * outcomes.length)];

            if (result.success) {
                // Add the amount to user's balance
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [result.amount, userId]);
                return message.reply(`🙏 ${result.text} You received **${result.amount} coins**.`);
            } else {
                return message.reply(`😔 ${result.text}`);
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your begging attempt.');
        }
    }
};
