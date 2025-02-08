const db = require('../../database/db');

module.exports = {
    name: 'potion',
    description: 'Brew and sell magical potions for coins!',
    async execute(message) {
        const userId = message.author.id;

        try {
            // Check if the user exists in the economy system
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [userId, 1000]);
            }

            // Define possible potions
            const potions = [
                { name: '🧪 Healing Potion', value: Math.floor(Math.random() * 150) + 50 },
                { name: '🍷 Stamina Potion', value: Math.floor(Math.random() * 200) + 80 },
                { name: '🔮 Magic Elixir', value: Math.floor(Math.random() * 300) + 100 },
                { name: '💀 Poisonous Brew', value: 0 }
            ];

            // Pick a random potion
            const brewedPotion = potions[Math.floor(Math.random() * potions.length)];

            if (brewedPotion.value > 0) {
                // Add value to user's balance
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [brewedPotion.value, userId]);
                return message.reply(`🧪 You successfully brewed a **${brewedPotion.name}** and sold it for **${brewedPotion.value} coins**!`);
            } else {
                return message.reply(`🧪 Oh no! You brewed a **${brewedPotion.name}**, and no one wants to buy it! No coins earned.`);
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your potion brewing.');
        }
    }
};
