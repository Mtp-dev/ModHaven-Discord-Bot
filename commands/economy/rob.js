const db = require('../../database/db');

module.exports = {
    name: 'rob',
    description: 'Attempt to rob another user for coins.',
    async execute(message, args) {
        const thiefId = message.author.id;
        const victim = message.mentions.users.first();

        if (!victim) {
            return message.reply('You need to mention a user to rob.');
        }

        const victimId = victim.id;

        if (thiefId === victimId) {
            return message.reply('You cannot rob yourself.');
        }

        try {
            // Get thief's and victim's balances
            const [thiefRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [thiefId]);
            const [victimRows] = await db.query('SELECT balance FROM economy WHERE user_id = ?', [victimId]);

            if (victimRows.length === 0 || victimRows[0].balance < 100) {
                return message.reply('The user you are trying to rob does not have enough coins.');
            }

            if (thiefRows.length === 0) {
                await db.query('INSERT INTO economy (user_id, balance) VALUES (?, ?)', [thiefId, 1000]);
            }

            // 50% chance to succeed
            const success = Math.random() < 0.5;

            if (success) {
                const amountStolen = Math.floor(Math.random() * (victimRows[0].balance * 0.5)) + 1; // Steal up to 50% of their balance
                await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [amountStolen, victimId]);
                await db.query('UPDATE economy SET balance = balance + ? WHERE user_id = ?', [amountStolen, thiefId]);

                return message.reply(`💰 You successfully robbed **${amountStolen} coins** from ${victim.username}!`);
            } else {
                const fine = Math.floor(Math.random() * 100) + 50; // Fine between 50 and 150 coins
                await db.query('UPDATE economy SET balance = balance - ? WHERE user_id = ?', [fine, thiefId]);

                return message.reply(`🚔 You got caught and paid a fine of **${fine} coins**.`);
            }
        } catch (error) {
            console.error(error);
            message.reply('There was an error processing your robbery.');
        }
    }
};
