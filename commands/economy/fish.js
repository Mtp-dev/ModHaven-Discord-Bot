const db = require('../../database/db');

module.exports = {
    name: 'fish',
    description: 'Go fishing and catch some fish for money!',
    async execute(message) {
        const userId = message.author.id;

        try {
            // Check if the user exists in the economy system
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000]);
            }

            // Define possible catches
            const fishTypes = [
                { name: '🐟 Small Fish', value: Math.floor(Math.random() * 100) + 20 },
                { name: '🐠 Clownfish', value: Math.floor(Math.random() * 200) + 50 },
                { name: '🐡 Pufferfish', value: Math.floor(Math.random() * 300) + 80 },
                { name: '🦈 Shark', value: Math.floor(Math.random() * 500) + 150 },
                { name: '🎣 Old Boot', value: 0 }
            ];

            // Pick a random fish
            const caughtFish = fishTypes[Math.floor(Math.random() * fishTypes.length)];

            if (caughtFish.value > 0) {
                // Add value to user's balance
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [caughtFish.value, userId]);
                return message.reply(`🎣 You caught a **${caughtFish.name}** and sold it for **${caughtFish.value} coins**!`);
            } else {
                return message.reply(`🎣 You caught an **${caughtFish.name}**... No coins for that!`);
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your fishing trip.');
        }
    }
};
