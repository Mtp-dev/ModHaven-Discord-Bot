const db = require('../../database/db');

module.exports = {
    name: 'farm',
    description: 'Plant and harvest crops for coins!',
    async execute(message) {
        const userId = message.author.id;

        try {
            // Check if the user exists in the economy system
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000]);
            }

            // Define possible crops to harvest
            const crops = [
                { name: '🌽 Corn', value: Math.floor(Math.random() * 100) + 30 },
                { name: '🥕 Carrot', value: Math.floor(Math.random() * 80) + 20 },
                { name: '🍎 Apple', value: Math.floor(Math.random() * 120) + 40 },
                { name: '🍇 Grapes', value: Math.floor(Math.random() * 200) + 50 },
                { name: '🌾 Wheat', value: Math.floor(Math.random() * 150) + 60 },
                { name: '🥔 Potato', value: Math.floor(Math.random() * 90) + 25 },
                { name: '🚫 Your crops didn’t grow!', value: 0 }
            ];

            // Pick a random crop
            const harvestedCrop = crops[Math.floor(Math.random() * crops.length)];

            if (harvestedCrop.value > 0) {
                // Add value to user's balance
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [harvestedCrop.value, userId]);
                return message.reply(`🚜 You harvested **${harvestedCrop.name}** and sold it for **${harvestedCrop.value} coins**!`);
            } else {
                return message.reply(`🚜 Your crops didn’t grow properly. No coins this time!`);
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your farming activity.');
        }
    }
};
