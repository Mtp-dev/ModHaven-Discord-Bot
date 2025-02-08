const db = require('../../database/db');

module.exports = {
    name: 'inventory',
    description: 'Check your purchased items.',
    async execute(message) {
        const userId = message.author.id;

        try {
            // Fetch user's inventory
            const [rows] = await db.query('SELECT item_name FROM inventory WHERE user_id = ?', [userId]);

            if (rows.length === 0) {
                return message.reply('Your inventory is empty.');
            }

            // Format inventory list
            let inventoryList = '**🎒 Your Inventory 🎒**\n';
            rows.forEach((item, index) => {
                inventoryList += `\`${index + 1}.\` **${item.item_name}**\n`;
            });

            message.channel.send(inventoryList);
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching your inventory.');
        }
    }
};
