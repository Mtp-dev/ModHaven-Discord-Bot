const db = require('../../database/db');

module.exports = {
    name: 'crime',
    description: 'Commit a crime and earn or lose money!',
    async execute(message) {
        const userId = message.author.id;

        try {
            // Check if the user exists in the economy table
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000]);
            }

            // Define crime outcomes
            const crimes = [
                { text: 'You successfully robbed a store', amount: Math.floor(Math.random() * 500) + 100, success: true },
                { text: 'You hacked into a bank and got away', amount: Math.floor(Math.random() * 1000) + 200, success: true },
                { text: 'You got caught pickpocketing and paid a fine', amount: Math.floor(Math.random() * 300) + 50, success: false },
                { text: 'You attempted a heist but got arrested and paid bail', amount: Math.floor(Math.random() * 700) + 150, success: false },
            ];

            // Pick a random crime outcome
            const crime = crimes[Math.floor(Math.random() * crimes.length)];

            if (crime.success) {
                // Add the earned money
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [crime.amount, userId]);
                return message.reply(`✅ ${crime.text}! You earned **${crime.amount} coins**.`);
            } else {
                // Deduct the fine
                await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [crime.amount, userId]);
                return message.reply(`🚨 ${crime.text}! You lost **${crime.amount} coins**.`);
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your crime.');
        }
    }
};
