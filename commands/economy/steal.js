const db = require('../../database/db');

module.exports = {
    name: 'steal',
    description: 'Attempt to steal an item from another player. Be careful, you might get caught!',
    async execute(message, args) {
        const thiefId = message.author.id;
        const victim = message.mentions.users.first();
        const itemName = args.slice(1).join(' ');

        if (!victim) {
            return message.reply('You need to mention a user to steal from.');
        }

        if (!itemName) {
            return message.reply('Please specify an item to steal.');
        }

        const victimId = victim.id;

        if (thiefId === victimId) {
            return message.reply('You cannot steal from yourself.');
        }

        try {
            // Check if victim owns the item
            const [victimInventory] = await db.query('SELECT * FROM inventory WHERE user_id = ? AND item_name = ?', [victimId, itemName]);

            if (victimInventory.length === 0) {
                return message.reply(`**${victim.username}** does not own **${itemName}**.`);
            }

            // Determine success chance (50%)
            const success = Math.random() < 0.5;

            if (success) {
                // Transfer item from victim to thief
                await db.query('DELETE FROM inventory WHERE user_id = ? AND item_name = ? LIMIT 1', [victimId, itemName]);
                await db.query('INSERT INTO inventory (user_id, item_name) VALUES (?, ?)', [thiefId, itemName]);

                return message.reply(`🕵️‍♂️ You successfully stole **${itemName}** from **${victim.username}**!`);
            } else {
                // Apply a fine to the thief
                const fine = Math.floor(Math.random() * 300) + 100;
                await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [fine, thiefId]);

                return message.reply(`🚔 You got caught trying to steal **${itemName}** from **${victim.username}**! You were fined **${fine} coins**.`);
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your theft attempt.');
        }
    }
};
