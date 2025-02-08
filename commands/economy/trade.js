const db = require('../../database/db');

module.exports = {
    name: 'trade',
    description: 'Trade an item with another player.',
    async execute(message, args) {
        const senderId = message.author.id;
        const recipient = message.mentions.users.first();
        const itemName = args.slice(1).join(' '); // Extract item name from arguments

        if (!recipient) {
            return message.reply('Please mention a user to trade with.');
        }

        if (!itemName) {
            return message.reply('Please specify an item to trade.');
        }

        const recipientId = recipient.id;

        if (senderId === recipientId) {
            return message.reply('You cannot trade with yourself.');
        }

        try {
            // Check if sender owns the item
            const [senderInventory] = await db.query('SELECT * FROM inventory WHERE user_id = ? AND item_name = ?', [senderId, itemName]);

            if (senderInventory.length === 0) {
                return message.reply(`You do not own **${itemName}**.`);
            }

            // Transfer item from sender to recipient
            await db.query('DELETE FROM inventory WHERE user_id = ? AND item_name = ? LIMIT 1', [senderId, itemName]);
            await db.query('INSERT INTO inventory (user_id, item_name) VALUES (?, ?)', [recipientId, itemName]);

            message.reply(`🔄 You successfully traded **${itemName}** with **${recipient.username}**!`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your trade.');
        }
    }
};
