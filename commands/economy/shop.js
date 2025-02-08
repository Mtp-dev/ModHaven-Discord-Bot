const db = require('../../database/db');

module.exports = {
    name: 'shop',
    description: 'View available items in the shop.',
    async execute(message) {
        try {
            // Fetch shop items from the database
            const [rows] = await db.query('SELECT item_name, price FROM shop ORDER BY price ASC');

            if (rows.length === 0) {
                return message.reply('The shop is currently empty.');
            }

            // Format the shop list
            let shopList = '**🛒 Server Shop 🛒**\n';
            rows.forEach((item, index) => {
                shopList += `\`${index + 1}.\` **${item.item_name}** - 💰 ${item.price} coins\n`;
            });

            message.channel.send(shopList);
        } catch (error) {
            console.error(error);
            message.reply('There was an error fetching the shop items.');
        }
    }
};
