const db = require('../../database/db');

module.exports = {
    name: 'hunt',
    description: 'Go hunting and catch animals for coins!',
    async execute(message) {
        const userId = message.author.id;

        try {
            // Check if the user exists in the economy system
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000]);
            }

            // Define possible animals to hunt
            const animals = [
                { name: '🐇 Rabbit', value: Math.floor(Math.random() * 100) + 50 },
                { name: '🦌 Deer', value: Math.floor(Math.random() * 200) + 100 },
                { name: '🐗 Wild Boar', value: Math.floor(Math.random() * 300) + 150 },
                { name: '🐻 Bear', value: Math.floor(Math.random() * 500) + 200 },
                { name: '🦅 Eagle', value: Math.floor(Math.random() * 400) + 180 },
                { name: '🦊 Fox', value: Math.floor(Math.random() * 250) + 120 },
                { name: '🚫 You missed!', value: 0 }
            ];

            // Pick a random animal
            const huntedAnimal = animals[Math.floor(Math.random() * animals.length)];

            if (huntedAnimal.value > 0) {
                // Add value to user's balance
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [huntedAnimal.value, userId]);
                return message.reply(`🔫 You hunted a **${huntedAnimal.name}** and sold it for **${huntedAnimal.value} coins**!`);
            } else {
                return message.reply(`🔫 You aimed... but missed! No coins for you.`);
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your hunting trip.');
        }
    }
};
