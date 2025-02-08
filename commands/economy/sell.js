const db = require('../../database/db');

module.exports = {
    name: 'sell',
    description: 'Sell an item from your inventory for coins.',
    async execute(message, args) {
        const userId = message.author.id;
        const itemName = args.join(' '); // User input for item name

        if (!itemName) {
            return message.reply('Please specify an item to sell.');
        }

        try {
            // Check if the item exists in the user's inventory
            const [inventoryRows] = await db.query('SELECT * FROM inventory WHERE user_id = ? AND item_name = ?', [userId, itemName]);

            if (inventoryRows.length === 0) {
                return message.reply(`You do not own **${itemName}**.`);
            }

            // Get the item's sell value from the shop
            const [shopRows] = await db.query('SELECT price FROM shop WHERE item_name = ?', [itemName]);

            if (shopRows.length === 0) {
                return message.reply('This item cannot be sold.');
            }

            const sellPrice = Math.floor(shopRows[0].price * 0.5); // Items sell for 50% of shop price

            // Remove the item from inventory and update balance
            await db.query('DELETE FROM inventory WHERE user_id = ? AND item_name = ? LIMIT 1', [userId, itemName]);
            await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [sellPrice, userId]);

            message.reply(`💰 You sold **${itemName}** for **${sellPrice} coins**!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your sale.');
        }
    }
};
