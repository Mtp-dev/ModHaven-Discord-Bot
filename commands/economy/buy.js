const db = require('../../database/db');

module.exports = {
    name: 'buy',
    description: 'Purchase an item from the shop.',
    async execute(message, args) {
        const userId = message.author.id;
        const itemName = args.join(' '); // Item name from arguments

        if (!itemName) {
            return message.reply('Please specify an item to buy.');
        }

        try {
            // Check if the item exists
            const [itemRows] = await db.query('SELECT * FROM shop WHERE item_name = ?', [itemName]);

            if (itemRows.length === 0) {
                return message.reply('That item does not exist in the shop.');
            }

            const item = itemRows[0];
            const itemPrice = item.price;

            // Check user's balance
            const [userRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [userId]);

            if (userRows.length === 0 || userRows[0].balance < itemPrice) {
                return message.reply('You do not have enough coins to buy this item.');
            }

            // Deduct item price from user's balance
            await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [itemPrice, userId]);

            // Store purchase in an inventory table (if applicable)
            await db.query('INSERT INTO inventory (user_id, item_name) VALUES (?, ?)', [userId, itemName]);

            message.reply(`You have successfully purchased **${itemName}** for **${itemPrice} coins**!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your purchase.');
        }
    }
};
